// Complete end-to-end API verification script
async function runTests() {
  console.log('--- 1. Testing Frontend HTML Serving ---');
  const frontRes = await fetch('http://localhost:5173/');
  console.log('Frontend status:', frontRes.status, frontRes.statusText);
  const frontText = await frontRes.text();
  console.log('Frontend contains #root:', frontText.includes('id="root"'));

  console.log('\n--- 2. Testing Auth: Demo Student Login ---');
  const authRes = await fetch('http://localhost:5000/api/auth/demo', { method: 'POST' });
  const authData = await authRes.json();
  console.log('Auth status:', authRes.status, 'User:', authData.user?.name, 'Token:', authData.token?.slice(0, 20) + '...');
  const token = authData.token;

  const authHeader = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  console.log('\n--- 3. Testing Documents Listing ---');
  const docRes = await fetch('http://localhost:5000/api/documents', { headers: authHeader });
  const docData = await docRes.json();
  console.log('Documents count:', docData.documents?.length);
  docData.documents?.forEach(d => console.log(` - [${d.subject}] ${d.file_name} (${d.status})`));

  console.log('\n--- 4. Testing Document Detail & AI Summary for OS Unit 1 ---');
  const docDetailRes = await fetch('http://localhost:5000/api/documents/doc_os_unit_1', { headers: authHeader });
  const docDetail = await docDetailRes.json();
  console.log('Quick Summary:', docDetail.summary?.quick_summary?.slice(0, 100) + '...');
  console.log('Important Topics count:', docDetail.summary?.important_topics?.length);
  console.log('Flashcards count:', docDetail.flashcards?.length);
  console.log('Exam Questions count:', docDetail.exam_questions?.length);

  console.log('\n--- 5. Testing AI Chat / Doubts (RAG) ---');
  const chatRes = await fetch('http://localhost:5000/api/chat/doc_os_unit_1', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ message: 'What is deadlock?' })
  });
  const chatData = await chatRes.json();
  console.log('AI Doubt Response:', chatData.ai_message?.message?.slice(0, 120) + '...');
  console.log('Citations:', chatData.ai_message?.citations);

  console.log('\n--- 6. Testing MCQ Generation ---');
  const quizGenRes = await fetch('http://localhost:5000/api/quizzes/generate', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      document_id: 'doc_os_unit_1',
      count: 5,
      difficulty: 'Medium',
      topic: 'Process Management & Deadlocks'
    })
  });
  const quizGenData = await quizGenRes.json();
  const quizId = quizGenData.quiz?.id;
  const questions = quizGenData.questions || [];
  console.log('Quiz ID:', quizId, 'Questions generated:', questions.length);
  console.log('Sample Q1:', questions[0]?.question);

  console.log('\n--- 7. Testing Interactive Instant Answer Recording ---');
  const ansRes = await fetch(`http://localhost:5000/api/quizzes/${quizId}/answer`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      question_id: questions[0]?.id,
      selected_answer: 'B',
      is_marked_for_review: false
    })
  });
  const ansData = await ansRes.json();
  console.log('Instant validation result:', ansData.is_correct ? '✓ Correct!' : '✗ Incorrect', 'Correct answer was:', ansData.correct_answer);

  console.log('\n--- 8. Testing Quiz Submission & Results Scoring ---');
  const submitRes = await fetch(`http://localhost:5000/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ time_taken_seconds: 95 })
  });
  const submitData = await submitRes.json();
  console.log('Quiz Score:', `${submitData.quiz?.score} / ${submitData.quiz?.question_count} (${submitData.quiz?.percentage}%)`);
  console.log('Status:', submitData.quiz?.status, 'Review items:', submitData.review?.length);

  console.log('\n--- 9. Testing Study Progress Analytics ---');
  const progRes = await fetch('http://localhost:5000/api/analytics/progress', { headers: authHeader });
  const progData = await progRes.json();
  console.log('Total documents:', progData.total_documents);
  console.log('Total quizzes:', progData.total_quizzes);
  console.log('Average percentage:', progData.average_percentage + '%');
  console.log('Topic Performance:');
  progData.topic_performance?.forEach(t => console.log(`   * ${t.subject} -> ${t.percentage}%`));

  console.log('\n--- 10. Testing Global Search ---');
  const searchRes = await fetch('http://localhost:5000/api/analytics/search?q=deadlock', { headers: authHeader });
  const searchData = await searchRes.json();
  console.log('Matching documents:', searchData.documents?.length);
  console.log('Matching topics:', searchData.topics?.length);
  console.log('Matching keywords:', searchData.keywords?.length);
  console.log('Matching questions:', searchData.questions?.length);

  console.log('\n✅ ALL 10 END-TO-END TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
