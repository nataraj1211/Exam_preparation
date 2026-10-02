import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

// Default initial state
const defaultData = {
  users: [],
  documents: [],
  summaries: [],
  flashcards: [],
  exam_questions: [],
  chat_messages: [],
  quizzes: [],
  questions: [],
  quiz_answers: []
};

class Database {
  constructor() {
    this.data = { ...defaultData };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all arrays exist
        for (const key of Object.keys(defaultData)) {
          if (!this.data[key]) this.data[key] = [];
        }
      } else {
        this.seedDemoData();
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, resetting with demo data:', err);
      this.seedDemoData();
      this.save();
    }
  }

  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  seedDemoData() {
    this.data = {
      users: [],
      documents: [],
      summaries: [],
      flashcards: [],
      exam_questions: [],
      chat_messages: [],
      quizzes: [],
      questions: [],
      quiz_answers: []
    };

    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('student123', salt);

    const demoUser = {
      id: 'usr_demo_student_01',
      name: 'Nataraj (MCA Scholar)',
      email: 'student@studymate.ai',
      password_hash: demoPasswordHash,
      target_exam: 'Semester End MCA / Tech Exams',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    };
    this.data.users.push(demoUser);

    // Document 1: Operating Systems Unit 1
    const osDocId = 'doc_os_unit_1';
    const osText = `OPERATING SYSTEMS - UNIT 1: PROCESS MANAGEMENT & DEADLOCKS

1. INTRODUCTION TO OPERATING SYSTEM
An Operating System (OS) is system software that acts as an intermediary between computer hardware and the computer user. Its primary goals are to make the computer system convenient to use, allocate hardware resources efficiently, and provide an environment in which user programs can run smoothly. Key functions include Process Management, Memory Management, File System Management, I/O System Management, and Protection/Security.

2. PROCESS MANAGEMENT & PCB
A Process is defined as a program in execution. Unlike a passive program stored on disk, a process is an active entity with a Program Counter, Stack, Data section, and Heap.
Process States:
- New: The process is being created.
- Ready: The process is waiting to be assigned to a processor.
- Running: Instructions are being executed by the CPU.
- Waiting/Blocked: The process is waiting for some event (such as I/O completion or signal reception).
- Terminated: The process has finished execution.

Process Control Block (PCB):
The PCB contains vital information associated with a specific process:
- Process State
- Program Counter (PC)
- CPU Registers (Accumulators, index registers, stack pointers)
- CPU Scheduling Information (Priority, scheduling queue pointers)
- Memory-Management Information (Base/limit registers, page tables)
- Accounting Information (CPU time used, time limits)
- I/O Status Information (List of allocated I/O devices, list of open files).

Context Switching:
Context switch is the mechanism of saving the state of the currently running process and restoring the state of another ready process so that CPU execution can be resumed from where it left off. The context is saved in the PCB. Context switch time is pure overhead because the system does no useful work while switching.

3. CPU SCHEDULING ALGORITHMS
CPU Scheduling is the process of deciding which process in the ready queue gets the CPU when the CPU becomes idle.
Scheduling Criteria:
- CPU Utilization: Keep the CPU as busy as possible (target: 40% to 90%).
- Throughput: Number of processes completed per unit time.
- Turnaround Time: Interval from submission of process to its completion.
- Waiting Time: Total amount of time a process spends waiting in the ready queue.
- Response Time: Time taken from submission until the first response is produced.

Key Algorithms:
1. First-Come, First-Served (FCFS): Non-preemptive. Simple FIFO queue. Suffers from Convoy Effect (short processes waiting behind long CPU-bound process).
2. Shortest Job First (SJF): Selects process with shortest next CPU burst. Provably optimal in minimizing average waiting time. Difficult to know future CPU burst length in practice.
3. Shortest Remaining Time First (SRTF): Preemptive version of SJF.
4. Round Robin (RR): Designed for time-sharing systems. Each process gets a small unit of CPU time (time quantum, typically 10-100 ms). Preemptive. High responsiveness. If time quantum is too large, RR behaves like FCFS; if too small, context switch overhead dominates.
5. Priority Scheduling: CPU allocated to highest priority process. Can lead to Starvation/Indefinite Blocking. Solution is Aging (gradually increasing priority of waiting processes).

4. DEADLOCKS
A Deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource held by some other process in the same set.

Coffman's Four Necessary Conditions for Deadlock:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources currently held by other processes.
3. No Preemption: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it after completing its task.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the cycle (P0 -> P1 -> P2 -> ... -> P0).

Deadlock Handling Strategies:
- Deadlock Prevention: Invalidate at least one of the four Coffman conditions (e.g., require processes to request all resources at once, or impose linear ordering of resource types).
- Deadlock Avoidance: System dynamically examines resource allocation state to ensure safe state. Banker's Algorithm is the classic avoidance algorithm for multiple instances of resources.
- Deadlock Detection and Recovery: Allow deadlock to occur, detect it via Wait-For Graphs or detection algorithms, then recover via process termination or resource preemption.
- Deadlock Ignorance (Ostrich Algorithm): Stick head in the sand and pretend deadlocks never occur; used by most modern operating systems like Windows and Linux due to high overhead of avoidance.`;

    const osDoc = {
      id: osDocId,
      user_id: demoUser.id,
      file_name: 'Operating Systems Unit 1.pdf',
      file_type: 'pdf',
      file_size: 245890,
      file_url: '/uploads/demo_os_unit1.pdf',
      subject: 'Operating Systems',
      extracted_text: osText,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: 'completed'
    };
    this.data.documents.push(osDoc);

    // Summary for OS
    this.data.summaries.push({
      id: 'sum_os_unit_1',
      document_id: osDocId,
      quick_summary: 'Comprehensive overview of Operating System fundamentals focusing on Process Management, Process Control Blocks (PCB), Context Switching, CPU Scheduling algorithms (FCFS, SJF, Round Robin), and Deadlock conditions and resolution strategies.',
      detailed_summary: 'This unit covers the foundational architecture of process execution and CPU resource distribution in modern operating systems. It begins by contrasting static programs with dynamic processes, enumerates the 5 lifecycle states (New, Ready, Running, Waiting, Terminated), and inspects the internal anatomy of the Process Control Block (PCB). Next, it analyzes CPU scheduling metrics (Throughput, Turnaround, Waiting, and Response times) along with preemptive and non-preemptive algorithms like FCFS (and the Convoy effect), SJF, SRTF, and Round Robin (emphasizing time quantum trade-offs). Finally, it investigates Deadlocks, establishing Coffman’s 4 necessary conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait) and evaluating Prevention, Banker’s Avoidance Algorithm, Detection/Recovery, and the Ostrich algorithm.',
      important_topics: [
        'Process Lifecycle & 5-State Transition Model',
        'Process Control Block (PCB) Structure & Fields',
        'Context Switching Mechanism & Overhead Cost',
        'CPU Scheduling Algorithms: FCFS, SJF, SRTF, Round Robin & Priority',
        'Coffman\'s 4 Necessary Conditions for Deadlock',
        'Deadlock Handling: Prevention, Banker\'s Algorithm (Avoidance), Detection & Recovery'
      ],
      keywords: [
        'Process', 'PCB', 'Context Switch', 'CPU Scheduling', 'Convoy Effect',
        'Turnaround Time', 'Waiting Time', 'Round Robin', 'Time Quantum',
        'Deadlock', 'Mutual Exclusion', 'Circular Wait', 'Banker\'s Algorithm', 'Aging'
      ],
      definitions: [
        { term: 'Process', definition: 'A program in execution, consisting of program code, program counter, registers, stack, and heap.' },
        { term: 'Context Switch', definition: 'The mechanism of saving the state of the active process into its PCB and restoring the state of another ready process.' },
        { term: 'Deadlock', definition: 'A state where two or more processes are permanently blocked because each is holding a resource and waiting for another resource held by another process.' },
        { term: 'Convoy Effect', definition: 'A phenomenon in FCFS scheduling where multiple short CPU-bound or I/O processes wait behind one long CPU-bound process.' },
        { term: 'Aging', definition: 'A technique of gradually increasing the priority of processes that wait in the system for a long time to prevent starvation.' }
      ],
      formulas: [
        { name: 'Turnaround Time', formula: 'TAT = Completion Time - Arrival Time' },
        { name: 'Waiting Time', formula: 'WT = Turnaround Time - Burst Time' },
        { name: 'Banker\'s Safety Condition', formula: 'Need[i, j] = Max[i, j] - Allocation[i, j] <= Available[j]' },
        { name: 'Throughput', formula: 'Throughput = Total Processes Completed / Total Time Elapsed' }
      ],
      exam_focus: {
        two_marks: [
          'Define Process and list its 5 states.',
          'What is a Process Control Block (PCB)? List any four contents.',
          'Define Context Switching and explain why it is treated as pure overhead.',
          'State Coffman\'s four necessary conditions for deadlock.',
          'What is the Convoy effect in FCFS scheduling?',
          'Distinguish between Preemptive and Non-Preemptive scheduling.'
        ],
        five_marks: [
          'Explain the 5-state process lifecycle with a neat state transition diagram.',
          'Compare SJF and Round Robin scheduling algorithms with respect to turnaround and response times.',
          'What is Starvation in Priority scheduling? How does Aging solve it?',
          'Explain the Banker\'s algorithm for deadlock avoidance with safety algorithm steps.',
          'Differentiate between Deadlock Prevention and Deadlock Avoidance.'
        ],
        ten_sixteen_marks: [
          'Discuss in detail the various CPU scheduling algorithms (FCFS, SJF, SRTF, RR) with suitable Gantt chart examples and compute average turnaround and waiting times.',
          'What is Deadlock? Explain Coffman\'s four conditions. Describe how Deadlock Prevention invalidates each condition and how Banker\'s algorithm maintains a safe state.',
          'Explain Context Switching in detail. Draw the architectural diagram showing PCB state preservation between Process P0 and Process P1.'
        ]
      },
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    });

    // Flashcards for OS
    this.data.flashcards.push(
      {
        id: 'fc_os_1',
        document_id: osDocId,
        front: 'What are the 5 states of a process in an Operating System?',
        back: '1. New (being created)\n2. Ready (waiting for CPU allocation)\n3. Running (instructions executing)\n4. Waiting/Blocked (waiting for I/O or event)\n5. Terminated (finished execution).',
        topic: 'Process Management',
        difficulty: 'Easy'
      },
      {
        id: 'fc_os_2',
        document_id: osDocId,
        front: 'What are Coffman\'s 4 necessary conditions for Deadlock?',
        back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait.\nIf any ONE condition is prevented, deadlock cannot occur!',
        topic: 'Deadlocks',
        difficulty: 'Medium'
      },
      {
        id: 'fc_os_3',
        document_id: osDocId,
        front: 'Why is Context Switch time called "pure overhead"?',
        back: 'Because during the time the CPU takes to save registers/state to PCB and load the new process state, the operating system does NO useful computational work for user processes.',
        topic: 'CPU Scheduling',
        difficulty: 'Medium'
      },
      {
        id: 'fc_os_4',
        document_id: osDocId,
        front: 'What is the Convoy Effect in FCFS scheduling?',
        back: 'A performance bottleneck where many short processes are forced to wait in the ready queue behind a single long, CPU-bound process, resulting in poor CPU and device utilization.',
        topic: 'CPU Scheduling',
        difficulty: 'Easy'
      },
      {
        id: 'fc_os_5',
        document_id: osDocId,
        front: 'How does the "Aging" technique prevent process starvation?',
        back: 'Aging gradually increases the priority of a process the longer it waits in the ready queue, ensuring that even low-priority processes eventually gain the highest priority and execute.',
        topic: 'CPU Scheduling',
        difficulty: 'Hard'
      }
    );

    // Exam Questions for OS
    this.data.exam_questions.push(
      {
        id: 'eq_os_1',
        document_id: osDocId,
        mark_category: '2_marks',
        question: 'What is a Process Control Block (PCB)? List four important fields stored in it.',
        answer_outline: 'A PCB is a kernel data structure representing a specific process.',
        key_points: ['Process State (Ready/Running/Waiting)', 'Program Counter', 'CPU Registers', 'Memory-management information (page/segment tables)']
      },
      {
        id: 'eq_os_2',
        document_id: osDocId,
        mark_category: '5_marks',
        question: 'Explain the working of Round Robin CPU scheduling and discuss the impact of Time Quantum size.',
        answer_outline: 'Round Robin is designed for time-sharing systems where ready processes are arranged in a FIFO queue and allocated CPU time up to 1 time quantum.',
        key_points: [
          'Preemptive scheduling with fixed time slice (q)',
          'If q is very large -> RR behaves like FCFS (Convoy effect risk)',
          'If q is very small -> Context switch overhead degrades system performance',
          'Optimal rule of thumb: 80% of CPU bursts should be shorter than q'
        ]
      },
      {
        id: 'eq_os_3',
        document_id: osDocId,
        mark_category: '10_marks',
        question: 'Explain Coffman\'s four conditions for deadlock. How does Deadlock Prevention eliminate deadlock by invalidating each condition?',
        answer_outline: 'Define Deadlock, explain Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait, and provide concrete prevention protocols for each.',
        key_points: [
          'Mutual Exclusion: Spooling or shareable read-only access',
          'Hold and Wait: Protocol requiring processes to request all resources upfront',
          'No Preemption: Preempt held resources if a new request cannot be allocated immediately',
          'Circular Wait: Impose strict global linear numerical ordering of all resource types'
        ]
      },
      {
        id: 'eq_os_4',
        document_id: osDocId,
        mark_category: '16_marks',
        question: 'Elaborate on CPU Scheduling criteria and compare FCFS, SJF, SRTF, and Round Robin scheduling algorithms with illustrative numerical examples.',
        answer_outline: 'Structure answer with definitions of CPU Utilization, Throughput, Turnaround Time, Waiting Time, Response Time, followed by side-by-side Gantt charts, tabular calculation, and pros/cons.',
        key_points: [
          'Formulas: TAT = CT - AT, WT = TAT - BT',
          'FCFS simplicity vs Convoy effect',
          'SJF mathematical optimality for minimum average waiting time',
          'SRTF preemptive advantages and difficulty in burst estimation',
          'Round Robin responsiveness in interactive time-sharing systems'
        ]
      }
    );

    // Document 2: DBMS Unit 1
    const dbmsDocId = 'doc_dbms_unit_1';
    const dbmsText = `DATABASE MANAGEMENT SYSTEMS - UNIT 1: ARCHITECTURE & RELATIONAL MODEL

1. INTRODUCTION TO DATABASE SYSTEMS
A Database Management System (DBMS) is software designed to store, manage, query, and retrieve data efficiently while maintaining integrity, concurrency, and security.
Advantages over traditional File Processing Systems:
- Reduction in Data Redundancy and Inconsistency
- Data Isolation and Independence
- Atomic Transactions (ACID properties)
- Concurrent Multi-user Access without race conditions
- Robust Security and Authorization mechanisms.

2. THREE-SCHEMA ARCHITECTURE (ANSI/SPARC)
The Three-Schema architecture separates user applications from the physical database:
1. Physical / Internal Level: Describes how data is actually stored on physical secondary storage media (B-trees, hashing, indexing, record formats).
2. Conceptual / Logical Level: Describes what data is stored in the entire database and relationships among data (entities, attributes, relationships, constraints). Managed by DBA.
3. External / View Level: Describes part of database that a particular user group is interested in (custom views, hidden sensitive columns).

Data Independence:
- Logical Data Independence: Capacity to change conceptual schema without altering external schemas or application programs (e.g., adding a new attribute).
- Physical Data Independence: Capacity to change internal/physical storage schema without altering conceptual schema (e.g., rebuilding an index or changing disk files). Physical data independence is easier to achieve than logical.

3. RELATIONAL MODEL CONCEPTS
Proposed by E.F. Codd in 1970.
- Relation: Represented as a two-dimensional Table.
- Tuple: A row in a relation representing an entity instance.
- Attribute: A named column representing a property of the relation.
- Domain: Set of permitted atomic values for an attribute.
- Cardinality: Number of tuples (rows) in a relation.
- Degree / Arity: Number of attributes (columns) in a relation.

Integrity Constraints:
1. Domain Constraint: Every attribute value must be atomic and drawn from defined domain.
2. Entity Integrity Constraint: No primary key attribute value can be NULL because it uniquely identifies tuples.
3. Referential Integrity Constraint: Foreign key values in referencing relation must either match a valid primary key value in the referenced relation, or be NULL.
4. Key Constraint: Minimal superkey that uniquely identifies tuples.

4. RELATIONAL ALGEBRA
Procedural query language comprising operations that take one or two relations as input and produce a new relation as output:
- Selection (σ): Selects tuples that satisfy a given predicate.
- Projection (π): Selects specified columns/attributes.
- Cartesian Product (X): Combines all tuples from two relations.
- Set Union (∪), Intersection (∩), Difference (-).
- Join (⋈): Combines related tuples from two relations based on join conditions (Theta join, Equi join, Natural join).
- Rename (ρ): Renames relation and attribute names.`;

    const dbmsDoc = {
      id: dbmsDocId,
      user_id: demoUser.id,
      file_name: 'DBMS Unit 1 - Relational Model & Architecture.pdf',
      file_type: 'pdf',
      file_size: 312400,
      file_url: '/uploads/demo_dbms_unit1.pdf',
      subject: 'Database Management Systems',
      extracted_text: dbmsText,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: 'completed'
    };
    this.data.documents.push(dbmsDoc);

    // Summary for DBMS
    this.data.summaries.push({
      id: 'sum_dbms_unit_1',
      document_id: dbmsDocId,
      quick_summary: 'Comprehensive examination of Database Management Systems covering File System drawbacks, ANSI/SPARC Three-Schema Architecture, Logical and Physical Data Independence, E.F. Codd Relational Model fundamentals, Integrity Constraints, and Relational Algebra operators.',
      detailed_summary: 'This study module investigates the evolution of data storage from file systems to modern relational database management systems. It details the ANSI/SPARC 3-tier architecture (Internal, Conceptual, External) and explores both Physical and Logical Data Independence. Core concepts of E.F. Codd\'s Relational Model are covered including Tuples, Attributes, Domains, Degree, and Cardinality. Crucial integrity constraints (Domain, Entity, Referential, and Key) are explained with real-world foreign key scenarios. Finally, fundamental operators of Relational Algebra (Selection, Projection, Cartesian Product, Set operations, and Joins) are presented as the theoretical foundation for SQL execution.',
      important_topics: [
        'Drawbacks of File Processing Systems vs DBMS',
        'ANSI/SPARC Three-Schema Architecture',
        'Logical vs Physical Data Independence',
        'Relational Model: Relation, Tuple, Attribute, Degree & Cardinality',
        'Integrity Constraints: Entity, Referential, Domain & Key',
        'Relational Algebra: Selection (σ), Projection (π), and Joins (⋈)'
      ],
      keywords: [
        'DBMS', 'Three-Schema', 'Physical Independence', 'Logical Independence',
        'Relation', 'Tuple', 'Attribute', 'Degree', 'Cardinality',
        'Entity Integrity', 'Referential Integrity', 'Foreign Key', 'Primary Key', 'Relational Algebra'
      ],
      definitions: [
        { term: 'Data Independence', definition: 'The capacity to alter a schema at one level of a database system without having to alter the schema at the next higher level.' },
        { term: 'Entity Integrity', definition: 'Rule stating that no primary key attribute value can be NULL, ensuring every tuple can be uniquely identified.' },
        { term: 'Referential Integrity', definition: 'Rule maintaining consistency between two relations: foreign key values must match an existing primary key value in the referenced relation, or be NULL.' },
        { term: 'Cardinality', definition: 'The total count of rows (tuples) present in a relation.' },
        { term: 'Degree', definition: 'The total count of columns (attributes) defining a relation.' }
      ],
      formulas: [
        { name: 'Relational Selection', formula: 'σ <condition> (Relation)' },
        { name: 'Relational Projection', formula: 'π <attribute_list> (Relation)' },
        { name: 'Cartesian Product Cardinality', formula: '|R × S| = |R| × |S|' },
        { name: 'Natural Join', formula: 'R ⋈ S = π(σ R.A = S.A (R × S))' }
      ],
      exam_focus: {
        two_marks: [
          'State any four advantages of DBMS over File Processing Systems.',
          'Define Degree and Cardinality of a relation.',
          'What is Entity Integrity constraint?',
          'What is Referential Integrity constraint? Give an example.',
          'Distinguish between Physical and Logical Data Independence.',
          'Define Selection (σ) and Projection (π) operators in relational algebra.'
        ],
        five_marks: [
          'Explain ANSI/SPARC 3-Schema Architecture with a neat diagram.',
          'Differentiate between Primary Key, Candidate Key, Super Key, and Foreign Key.',
          'Explain the concept of Data Independence and why Physical data independence is easier to achieve.',
          'Describe the fundamental operations in Relational Algebra with examples.'
        ],
        ten_sixteen_marks: [
          'Describe in detail the 3-Tier ANSI/SPARC Architecture. Explain how it provides Logical and Physical Data Independence with relevant examples.',
          'Explain Codd\'s Relational Model concepts in detail. Discuss all integrity constraints with suitable student-course database schemas.',
          'Explain Relational Algebra fundamental and extended operations (Selection, Projection, Cartesian Product, Union, Set Difference, and Joins) with sample relations and queries.'
        ]
      },
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    });

    // Sample initial Quiz for OS
    const quiz1Id = 'quiz_demo_os_01';
    this.data.quizzes.push({
      id: quiz1Id,
      user_id: demoUser.id,
      document_id: osDocId,
      topic: 'Process Management & Deadlocks',
      difficulty: 'Medium',
      question_count: 5,
      score: 4,
      percentage: 80,
      correct_count: 4,
      wrong_count: 1,
      skipped_count: 0,
      time_taken_seconds: 145,
      status: 'completed',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    });

    const osQuestions = [
      {
        id: 'q_os_1',
        quiz_id: quiz1Id,
        question: 'Which of the following process states represents a process waiting to be assigned to the processor?',
        option_a: 'Blocked',
        option_b: 'Ready',
        option_c: 'New',
        option_d: 'Waiting',
        correct_answer: 'B',
        explanation: 'The Ready state indicates that a process is loaded in main memory and ready for CPU allocation, waiting for the scheduler.'
      },
      {
        id: 'q_os_2',
        quiz_id: quiz1Id,
        question: 'What is the phenomenon in FCFS scheduling where short processes wait behind a long CPU-bound process called?',
        option_a: 'Starvation',
        option_b: 'Aging',
        option_c: 'Convoy Effect',
        option_d: 'Deadlock',
        correct_answer: 'C',
        explanation: 'The Convoy Effect occurs in FCFS when smaller I/O or CPU processes are held up behind one massive CPU-burst job.'
      },
      {
        id: 'q_os_3',
        quiz_id: quiz1Id,
        question: 'Which scheduling algorithm is mathematically provable to yield the minimum average waiting time?',
        option_a: 'First-Come, First-Served (FCFS)',
        option_b: 'Round Robin (RR)',
        option_c: 'Shortest Job First (SJF)',
        option_d: 'Priority Scheduling',
        correct_answer: 'C',
        explanation: 'SJF (Shortest Job First) is provably optimal because assigning the CPU to shorter jobs first reduces the waiting time of all subsequent jobs.'
      },
      {
        id: 'q_os_4',
        quiz_id: quiz1Id,
        question: 'Which of the following is NOT one of Coffman\'s four necessary conditions for deadlock?',
        option_a: 'Mutual Exclusion',
        option_b: 'Hold and Wait',
        option_c: 'Preemption of Resources',
        option_d: 'Circular Wait',
        correct_answer: 'C',
        explanation: 'The necessary condition is NO PREEMPTION. If preemption of resources is allowed, deadlock cannot occur.'
      },
      {
        id: 'q_os_5',
        quiz_id: quiz1Id,
        question: 'What is the purpose of the "Aging" technique in CPU scheduling?',
        option_a: 'To speed up context switches',
        option_b: 'To prevent starvation of low-priority processes',
        option_c: 'To detect deadlocks dynamically',
        option_d: 'To reduce time quantum in Round Robin',
        correct_answer: 'B',
        explanation: 'Aging gradually increases the priority of processes that wait in the system for long durations, resolving the starvation problem.'
      }
    ];

    this.data.questions.push(...osQuestions);

    this.data.quiz_answers.push(
      { id: 'ans_1', quiz_id: quiz1Id, question_id: 'q_os_1', selected_answer: 'B', is_correct: true, is_marked_for_review: false },
      { id: 'ans_2', quiz_id: quiz1Id, question_id: 'q_os_2', selected_answer: 'C', is_correct: true, is_marked_for_review: false },
      { id: 'ans_3', quiz_id: quiz1Id, question_id: 'q_os_3', selected_answer: 'C', is_correct: true, is_marked_for_review: false },
      { id: 'ans_4', quiz_id: quiz1Id, question_id: 'q_os_4', selected_answer: 'B', is_correct: false, is_marked_for_review: true },
      { id: 'ans_5', quiz_id: quiz1Id, question_id: 'q_os_5', selected_answer: 'B', is_correct: true, is_marked_for_review: false }
    );

    // Initial Chat messages for OS
    this.data.chat_messages.push(
      {
        id: 'msg_1',
        document_id: osDocId,
        user_id: demoUser.id,
        role: 'user',
        message: 'What is deadlock?',
        citations: [],
        created_at: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'msg_2',
        document_id: osDocId,
        user_id: demoUser.id,
        role: 'assistant',
        message: 'Deadlock is a situation in which two or more processes are waiting indefinitely for resources held by each other in a closed loop. None of the processes can proceed, release their resources, or complete execution.\n\nAccording to the uploaded material, Deadlock occurs only when four conditions hold simultaneously (Coffman\'s Conditions):\n1. **Mutual Exclusion** (non-shareable resources)\n2. **Hold and Wait** (holding one while requesting another)\n3. **No Preemption** (resources cannot be forcibly taken)\n4. **Circular Wait** (P0 awaits P1, P1 awaits P2 ... Pn awaits P0).',
        citations: ['Section 4. Deadlocks', 'Coffman\'s Four Conditions'],
        created_at: new Date(Date.now() - 4 * 86400000 + 2000).toISOString()
      }
    );
  }

  // Generic helper methods
  find(collection, predicate) {
    if (!this.data[collection]) return [];
    if (!predicate) return this.data[collection];
    return this.data[collection].filter(predicate);
  }

  findOne(collection, predicate) {
    if (!this.data[collection]) return null;
    return this.data[collection].find(predicate) || null;
  }

  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, predicate, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(predicate);
    if (index === -1) return null;
    this.data[collection][index] = { ...this.data[collection][index], ...updates };
    this.save();
    return this.data[collection][index];
  }

  remove(collection, predicate) {
    if (!this.data[collection]) return false;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => !predicate(item));
    const removed = this.data[collection].length !== initialLen;
    if (removed) this.save();
    return removed;
  }
}

export const db = new Database();
