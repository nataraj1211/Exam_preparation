import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';

export async function extractTextFromFile(filePath, originalFilename) {
  const ext = path.extname(originalFilename || filePath).toLowerCase();
  
  if (!fs.existsSync(filePath)) {
    throw new Error('File does not exist on disk.');
  }

  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    throw new Error('The uploaded file is empty. Please upload a valid document.');
  }

  let extractedText = '';

  switch (ext) {
    case '.pdf': {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text || '';
      } catch (err) {
        console.error('PDF parsing error:', err);
        throw new Error('Failed to parse PDF document. It may be corrupted or password-protected.');
      }
      break;
    }

    case '.docx': {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value || '';
      } catch (err) {
        console.error('DOCX parsing error:', err);
        throw new Error('Failed to parse DOCX document. Ensure it is a valid Word document.');
      }
      break;
    }

    case '.pptx': {
      try {
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();
        const slideTexts = [];

        // Sort slide entries numerically
        const slideEntries = zipEntries
          .filter(entry => entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml'))
          .sort((a, b) => {
            const numA = parseInt(a.entryName.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.entryName.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });

        for (let i = 0; i < slideEntries.length; i++) {
          const content = slideEntries[i].getData().toString('utf8');
          // Extract text between <a:t>...</a:t>
          const matches = content.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
          if (matches) {
            const text = matches
              .map(m => m.replace(/<[^>]+>/g, '').trim())
              .filter(Boolean)
              .join(' ');
            if (text) {
              slideTexts.push(`--- Slide ${i + 1} ---\n${text}`);
            }
          }
        }

        extractedText = slideTexts.join('\n\n');
        if (!extractedText.trim()) {
          // Fallback scan notes or all XML text
          const allTextMatches = zipEntries
            .filter(e => e.entryName.includes('slide') && e.entryName.endsWith('.xml'))
            .map(e => e.getData().toString('utf8').match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [])
            .flat()
            .map(m => m.replace(/<[^>]+>/g, '').trim())
            .filter(Boolean)
            .join(' ');
          extractedText = allTextMatches;
        }
      } catch (err) {
        console.error('PPTX parsing error:', err);
        throw new Error('Failed to parse PowerPoint presentation.');
      }
      break;
    }

    case '.txt': {
      try {
        extractedText = fs.readFileSync(filePath, 'utf-8');
      } catch (err) {
        console.error('TXT reading error:', err);
        throw new Error('Failed to read text file.');
      }
      break;
    }

    default:
      throw new Error(`Unsupported file type: ${ext}. Supported formats are .pdf, .docx, .pptx, and .txt.`);
  }

  // Clean and sanitize extracted text
  extractedText = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!extractedText || extractedText.length < 5) {
    throw new Error('Could not extract sufficient text from the document. The document might contain only scanned images or be empty.');
  }

  return extractedText;
}
