import React, { useState } from 'react';
import { Download, Copy, Check, FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface PDFExportProps {
  type: 'summary' | 'questions' | 'quiz_result';
  data: any;
  title: string;
}

export const PDFExportButton: React.FC<PDFExportProps> = ({ type, data, title }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let textToCopy = '';
    if (type === 'summary') {
      textToCopy = `=== ${title} - AI STUDY SUMMARY ===\n\n` +
        `QUICK SUMMARY:\n${data.quick_summary}\n\n` +
        `DETAILED SUMMARY:\n${data.detailed_summary}\n\n` +
        `KEY TOPICS:\n${data.important_topics?.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}\n\n` +
        `KEYWORDS:\n${data.keywords?.join(', ')}`;
    } else if (type === 'questions') {
      textToCopy = `=== ${title} - IMPORTANT EXAM QUESTIONS ===\n\n` +
        (Array.isArray(data) ? data.map((q: any, i: number) => 
          `[${q.mark_category.replace('_', ' ').toUpperCase()}] Q${i + 1}: ${q.question}\nOutline: ${q.answer_outline}\nKey Points: ${q.key_points?.join(', ')}\n`
        ).join('\n---\n') : '');
    } else if (type === 'quiz_result') {
      textToCopy = `=== ${title} - QUIZ RESULTS ===\n` +
        `Score: ${data.quiz?.score} / ${data.quiz?.question_count} (${data.quiz?.percentage}%)\n` +
        `Correct: ${data.quiz?.correct_count} | Wrong: ${data.quiz?.wrong_count} | Skipped: ${data.quiz?.skipped_count}\n\n` +
        (data.review?.map((r: any, i: number) => 
          `Q${i + 1}: ${r.question}\nYour Answer: ${r.user_answer || 'Skipped'} | Correct: ${r.correct_answer} (${r.is_correct ? 'CORRECT' : 'WRONG'})\nExplanation: ${r.explanation}\n`
        ).join('\n') || '');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      // Header Banner
      doc.setFillColor(79, 70, 229); // Indigo
      doc.rect(0, 0, pageWidth, 24, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('StudyMate AI - Exam Preparation Dossier', margin, 12);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Upload. Understand. Practice. Score. | ' + new Date().toLocaleDateString(), margin, 18);

      y = 32;

      // Document Title
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += 8;

      if (type === 'summary') {
        // Quick Summary Section
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
        doc.setFontSize(11);
        doc.setTextColor(79, 70, 229);
        doc.text('Quick Summary', margin + 4, y + 6);
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const quickLines = doc.splitTextToSize(data.quick_summary || 'N/A', contentWidth - 8);
        doc.text(quickLines.slice(0, 3), margin + 4, y + 12);
        y += 30;

        // Important Topics
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Key Syllabus Topics', margin, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        (data.important_topics || []).forEach((topic: string, i: number) => {
          doc.text(`•  ${topic}`, margin + 2, y);
          y += 5.5;
        });
        y += 4;

        // Detailed Summary
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Detailed Exam Notes', margin, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const detailLines = doc.splitTextToSize(data.detailed_summary || 'N/A', contentWidth);
        doc.text(detailLines, margin, y);

      } else if (type === 'questions') {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Curated University Exam Questions & Outlines', margin, y);
        y += 8;

        (data || []).forEach((item: any, i: number) => {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          doc.text(`Q${i + 1} (${item.mark_category?.replace('_', ' ').toUpperCase()}): ${item.question}`, margin, y);
          y += 6;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          const outlineLines = doc.splitTextToSize(`Answer Outline: ${item.answer_outline}`, contentWidth - 4);
          doc.text(outlineLines, margin + 2, y);
          y += outlineLines.length * 5 + 4;
        });

      } else if (type === 'quiz_result') {
        // Result Score Box
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');
        doc.setFontSize(12);
        doc.setTextColor(67, 56, 202);
        doc.setFont('helvetica', 'bold');
        doc.text(`Final Score: ${data.quiz?.score} / ${data.quiz?.question_count} (${data.quiz?.percentage}%)`, margin + 5, y + 8);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Correct: ${data.quiz?.correct_count}  |  Wrong: ${data.quiz?.wrong_count}  |  Skipped: ${data.quiz?.skipped_count}`, margin + 5, y + 15);
        y += 28;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Detailed Question Review & Explanations', margin, y);
        y += 7;

        (data.review || []).forEach((r: any, idx: number) => {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(r.is_correct ? 16 : 220, r.is_correct ? 120 : 38, r.is_correct ? 80 : 38);
          doc.text(`Question ${idx + 1}: ${r.is_correct ? '✓ Correct' : r.is_skipped ? '○ Skipped' : '✗ Wrong'}`, margin, y);
          y += 5;

          doc.setFontSize(8.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
          const qLines = doc.splitTextToSize(r.question, contentWidth - 4);
          doc.text(qLines, margin + 2, y);
          y += qLines.length * 4.5 + 2;

          doc.setTextColor(100, 116, 139);
          doc.text(`Your Choice: ${r.user_answer || 'None'}  |  Correct: ${r.correct_answer}`, margin + 2, y);
          y += 5;

          const expLines = doc.splitTextToSize(`Explanation: ${r.explanation}`, contentWidth - 4);
          doc.text(expLines, margin + 2, y);
          y += expLines.length * 4.5 + 5;
        });
      }

      // Save PDF
      const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      doc.save(`StudyMate_${type}_${safeTitle}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
        title="Copy to Clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy Text</span>
          </>
        )}
      </button>

      {/* Download PDF Button */}
      <button
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        {downloading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <FileDown className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </>
        )}
      </button>
    </div>
  );
};
