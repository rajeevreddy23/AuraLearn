'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Navbar } from '@/components/layout/Navbar';
import { useAI } from '@/contexts/AIContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn, generateId } from '@/lib/utils';
import { MOCK_COURSES, TEACHER_STYLES } from '@/lib/constants';
import type { TeacherStyle, BoardContentItem, BoardPage, TeacherStyleId } from '@/types';

import {
  Play, Pause, MessageSquare, Volume2, VolumeX,
  Settings, BookOpen, Code2, Sparkles, Bot, X, Send,
  Sun, Moon, Loader2, StopCircle, RefreshCw, ChevronRight,
  Download, FileText, Maximize2, Minimize2, SkipBack, SkipForward,
  Quote, Award, Calendar as CalendarIcon, Clock, Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TeacherAvatar } from '@/components/classroom/TeacherAvatar';
import { ConceptDiagram } from '@/components/classroom/ConceptDiagram';
import { StudentDashboard } from '@/components/classroom/StudentDashboard';
import { PomodoroTimer } from '@/components/classroom/PomodoroTimer';
import { CalendarIntegration } from '@/components/classroom/CalendarIntegration';
import { NotesGenerator } from '@/components/classroom/NotesGenerator';

export default function ClassroomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('course');
  const topicParam = searchParams.get('topic');
  const teacherId = (searchParams.get('teacher') || 'professor') as TeacherStyleId;

  const teacher = TEACHER_STYLES.find(t => t.id === teacherId) || TEACHER_STYLES[0];
  const course = courseId ? MOCK_COURSES.find(c => c.id === courseId) : null;
  const topic = topicParam || course?.title || '';

  const [boardStyle, setBoardStyle] = useState<'whiteboard' | 'blackboard'>('blackboard');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'doubt' | 'notes' | 'timer' | 'calendar' | null>(null);
  
  // Dashboard & Gamification States
  const [showDashboard, setShowDashboard] = useState(false);
  const [xpPoints, setXpPoints] = useState(150);
  const [weakTopics, setWeakTopics] = useState<string[]>(['Recursion Base Cases']);
  const [quizHistory, setQuizHistory] = useState<{ topic: string; correct: number; total: number; timestamp: Date }[]>([]);
  
  // Interactive Quiz States
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtAnswer, setDoubtAnswer] = useState('');
  const [doubtLoading, setDoubtLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWideView, setIsWideView] = useState(false);
  const [inputTopic, setInputTopic] = useState(topic);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    course?.level || 'beginner'
  );

  // Board state
  const [boardPages, setBoardPages] = useState<BoardPage[]>([{
    id: generateId(),
    pageNumber: 1,
    items: [],
    createdAt: new Date(),
    downloaded: false,
  }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeakingLesson, setIsSpeakingLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [selectedVoiceGender, setSelectedVoiceGender] = useState<'female' | 'male'>('female');
  const [currentSection, setCurrentSection] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [showConceptMap, setShowConceptMap] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedAt, setPausedAt] = useState<{pageIndex: number; charOffset: number} | null>(null);
  const [highlightColor, setHighlightColor] = useState('indigo');
  
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [canvasTheme, setCanvasTheme] = useState<'cyber' | 'chalk' | 'studio' | 'terminal'>('cyber');
  const [gridPattern, setGridPattern] = useState<'dots' | 'lines' | 'cyber' | 'none'>('cyber');
  const [ambientAudio, setAmbientAudio] = useState<'off' | 'lofi' | 'rain' | 'coffee'>('off');

  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientNodeRef = useRef<AudioNode | null>(null);

  const classroomRef = useRef<HTMLDivElement>(null);
  const boardEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const flyingRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { setAssistantEmotion, setAssistantAnimation } = useAI();

  useEffect(() => {
    setAssistantEmotion('happy');
    setAssistantAnimation('idle');
  }, [setAssistantEmotion, setAssistantAnimation]);

  useEffect(() => {
    boardEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [boardPages, currentPage]);

  const startAmbientAudio = useCallback((type: 'off' | 'lofi' | 'rain' | 'coffee') => {
    if (typeof window === 'undefined') return;
    
    if (ambientNodeRef.current) {
      try {
        (ambientNodeRef.current as any).stop();
      } catch {}
      ambientNodeRef.current = null;
    }
    
    if (type === 'off') return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'rain' ? 800 : 250;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = type === 'rain' ? 0.08 : type === 'lofi' ? 0.05 : 0.04;
      
      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      whiteNoise.start();
      ambientNodeRef.current = whiteNoise as any;
    } catch (e) {
      console.warn("Web Audio API not initialized:", e);
    }
  }, []);

  useEffect(() => {
    startAmbientAudio(ambientAudio);
    return () => {
      if (ambientNodeRef.current) {
        try {
          (ambientNodeRef.current as any).stop();
        } catch {}
      }
    };
  }, [ambientAudio, startAmbientAudio]);

  // Auto-start if we have a course/topic
  useEffect(() => {
    if (topic && boardPages[0].items.length === 0 && !isGenerating) {
      generateLesson();
    }
  }, []);

  const currentBoard = boardPages[currentPage];

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeakingLesson(false);
  }, []);

  const getSelectedVoice = useCallback((gender: 'female' | 'male') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    
    // Curated high quality English voices for female/male
    const femaleNames = ['samantha', 'zira', 'karen', 'google us english', 'google uk english female', 'hazel', 'moira', 'tessa'];
    const maleNames = ['david', 'daniel', 'google uk english male', 'google us english male', 'mark', 'ravi', 'richard'];
    
    const filterNames = gender === 'female' ? femaleNames : maleNames;
    
    // Try to find custom sweet voice match from list
    for (const name of filterNames) {
      const match = voices.find(v => v.name.toLowerCase().includes(name));
      if (match) return match;
    }
    
    // Fallback to matching language and gender keyword in name
    const langMatch = voices.filter(v => v.lang.startsWith('en'));
    if (langMatch.length > 0) {
      if (gender === 'female') {
        const femaleVoice = langMatch.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'));
        if (femaleVoice) return femaleVoice;
      } else {
        const maleVoice = langMatch.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('daniel'));
        if (maleVoice) return maleVoice;
      }
      return langMatch[0];
    }
    
    return voices[0] || null;
  }, []);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.pitch = teacherId === 'friend' ? 1.2 : teacherId === 'expert' ? 0.9 : 1;
    utterance.volume = 1;
    
    const voice = getSelectedVoice(selectedVoiceGender);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeakingLesson(true);
    utterance.onend = () => setIsSpeakingLesson(false);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceSpeed, teacherId, selectedVoiceGender, getSelectedVoice]);

  const handleQuizAnswer = (isCorrect: boolean, quizTopic: string, selectedOption: string) => {
    if (isCorrect) {
      setXpPoints(prev => prev + 50);
      toast.success('Correct answer! +50 XP');
    } else {
      setWeakTopics(prev => {
        if (prev.includes(quizTopic)) return prev;
        return [...prev, quizTopic];
      });
      toast.error('Incorrect answer. Focus area logged.');
    }
    
    setQuizHistory(prev => [
      ...prev,
      {
        topic: quizTopic,
        correct: isCorrect ? 1 : 0,
        total: 1,
        timestamp: new Date()
      }
    ]);
  };

  const startVoiceRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListeningVoice(true);
        toast('Listening for voice doubt...', { icon: '🎙️' });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDoubtQuestion(transcript);
        toast.success(`Heard: "${transcript}"`);
        
        // Trigger doubt submit
        setDoubtLoading(true);
        setDoubtAnswer('');
        setIsPaused(true);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        
        fetch('/api/v1/agents/teach/doubt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: transcript, lesson_context: currentSection || topic }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              const answer = data.data.explanation || data.data;
              setDoubtAnswer(answer);
              speakText(answer);
            } else {
              throw new Error();
            }
          })
          .catch(() => {
            const mock = `That is a great question! For "${transcript}", think of it as building layers of blocks where each layer depends on the previous one. Does that analogy help make it clearer?`;
            setDoubtAnswer(mock);
            speakText(mock);
          })
          .finally(() => setDoubtLoading(false));
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  }, [currentSection, topic, speakText]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListeningVoice(false);
  }, []);

  const scrollToSection = useCallback((idx: number) => {
    setCurrentPage(idx);
    const elements = document.querySelectorAll('[data-section]');
    if (elements[idx]) {
      elements[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const generateLesson = useCallback(async () => {
    const teachTopic = inputTopic || topic;
    if (!teachTopic.trim()) return;

    abortRef.current = new AbortController();
    setIsGenerating(true);

    const freshPage: BoardPage = {
      id: generateId(),
      pageNumber: 1,
      items: [],
      createdAt: new Date(),
      downloaded: false,
    };
    setBoardPages([freshPage]);
    setCurrentPage(0);
    setLessonTitle('');
    setObjectives([]);
    setCurrentSection('');
    setAssistantEmotion('thinking');
    setAssistantAnimation('thinking');

    // Build teacher-specific system prompt
    const teacherPrompt = buildTeacherPrompt(teacher, teachTopic, level);

    try {
      const res = await fetch('/api/v1/agents/generate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${await user.getIdToken()}` } : {}),
        },
        body: JSON.stringify({
          prompt: teacherPrompt,
          system_prompt: `You are ${teacher.name}, an AI teacher on the AURA Learn platform. ${teacher.description}`,
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error('Failed to generate lesson');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';
      let textBuffer = '';

      const appendItem = (type: 'heading' | 'text' | 'code' | 'bullets' | 'diagram' | 'quiz', content: string) => {
        setBoardPages(prev => {
          const pages = [...prev];
          const current = { ...pages[pages.length - 1] };
          current.items = [...current.items, {
            id: generateId(),
            type,
            content,
            isStreaming: true,
            timestamp: new Date(),
          }];
          pages[pages.length - 1] = current;
          return pages;
        });
        if (type === 'text') {
          speakText(content);
          setCurrentSection(content.slice(0, 100));
        } else if (type === 'bullets') {
          const speakableText = content.split('||').join('. ');
          speakText(speakableText);
          setCurrentSection(speakableText.slice(0, 100));
        } else if (type === 'quiz') {
          speakText("Time for a checkpoint quiz. Please review the challenge on the board.");
          setCurrentSection("Checkpoint Quiz");
          setIsPaused(true);
        }
      };

      const updateLastItem = (content: string) => {
        setBoardPages(prev => {
          const pages = [...prev];
          const current = { ...pages[pages.length - 1] };
          const items = [...current.items];
          if (items.length > 0) {
            items[items.length - 1] = { ...items[items.length - 1], content, isStreaming: true };
          }
          current.items = items;
          pages[pages.length - 1] = current;
          return pages;
        });
      };

      const finalizeLastItem = () => {
        setBoardPages(prev => {
          const pages = [...prev];
          const current = { ...pages[pages.length - 1] };
          current.items = current.items.map(item => ({ ...item, isStreaming: false }));
          pages[pages.length - 1] = current;
          return pages;
        });
      };

      // Start a new board page for each slide
      const startNewBoardPage = () => {
        setBoardPages(prev => {
          const pages = [...prev];
          const lastPage = pages[pages.length - 1];
          if (lastPage.items.length === 0) {
            return pages;
          }
          const newPage: BoardPage = {
            id: generateId(),
            pageNumber: lastPage.pageNumber + 1,
            items: [],
            createdAt: new Date(),
            downloaded: false,
          };
          pages.push(newPage);
          setCurrentPage(pages.length - 1);
          return pages;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('##TITLE##')) {
            setLessonTitle(trimmed.replace('##TITLE##', '').trim());
          } else if (trimmed.startsWith('##OBJECTIVES##')) {
            setObjectives(trimmed.replace('##OBJECTIVES##', '').trim().split('||').filter(Boolean));
          } else if (trimmed.startsWith('##HEADING##')) {
            finalizeLastItem();
            startNewBoardPage();
            const content = trimmed.replace('##HEADING##', '').trim();
            appendItem('heading', content);
          } else if (trimmed.startsWith('##BULLETS##')) {
            finalizeLastItem();
            const content = trimmed.replace('##BULLETS##', '').trim();
            appendItem('bullets', content);
          } else if (trimmed.startsWith('##DIAGRAM##')) {
            finalizeLastItem();
            const content = trimmed.replace('##DIAGRAM##', '').trim();
            appendItem('diagram', content);
          } else if (trimmed.startsWith('##QUIZ##')) {
            finalizeLastItem();
            const content = trimmed.replace('##QUIZ##', '').trim();
            appendItem('quiz', content);
          } else if (trimmed.startsWith('##CODE##')) {
            finalizeLastItem();
            const content = trimmed.replace('##CODE##', '').trim();
            appendItem('code', content);
          } else if (trimmed.startsWith('##TEXT##')) {
            finalizeLastItem();
            const content = trimmed.replace('##TEXT##', '').trim();
            if (content) appendItem('text', content);
          } else if (trimmed.startsWith('##PAUSE##')) {
            setIsPaused(true);
          } else if (trimmed.startsWith('##RESUME##')) {
            setIsPaused(false);
          }
        }
      }

      finalizeLastItem();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // Fallback: teach without API
      fallbackTeaching(teachTopic, level);
    } finally {
      setIsGenerating(false);
      setAssistantEmotion('happy');
      setAssistantAnimation('idle');
      setBoardPages(prev => {
        const pages = [...prev];
        const last = { ...pages[pages.length - 1] };
        last.items = last.items.map(item => ({ ...item, isStreaming: false }));
        pages[pages.length - 1] = last;
        return pages;
      });
    }
  }, [inputTopic, topic, level, teacher, user, setAssistantEmotion, setAssistantAnimation, speakText]);

  const buildTeacherPrompt = (t: typeof teacher, teachTopic: string, lvl: string) => {
    const styleMap: Record<string, string> = {
      professor: 'Teach like a university professor with structured, comprehensive explanations. Use formal language, build from fundamentals, and cover topics in depth.',
      coach: 'Teach like a motivational coach with practical, hands-on explanations. Focus on "why this matters" and real applications. Be encouraging.',
      friend: 'Teach like a friendly guide. Use casual language, humor, and everyday analogies. Make learning feel natural and fun. Say things like "think of it this way..."',
      expert: 'Teach like a senior industry expert. Focus on best practices, advanced insights, and professional techniques. Be precise and authoritative.',
      simplifier: 'Teach like someone who makes complex topics simple. Use step-by-step breakdowns, simple analogies, and clear explanations. "Explain like I\'m 5" approach.',
    };

    return `Teach a slide-based masterclass lesson on "${teachTopic}" tailored for a ${lvl} student.

Your teaching style: ${styleMap[t.id] || styleMap.professor}

Guidelines for Advanced, Visual Teaching:
1. **Slide Format**: Break down the topic into 5-6 logical slides.
2. **First-Principles Breakdown**: Don't just define terms. Explain the core "why" and "how". Build up complex concepts step-by-step.
3. **Structured Bullet Points**: For each slide, write 3-4 clear, high-impact bullet points summarizing the core information.
4. **Visual Conceptual Diagrams**: For every slide, define a visual hierarchical tree diagram mapping the main concepts. Make the labels short and descriptive (e.g. Brain, Hands, Eyes, Data, Security, Flow).
5. **Commented Code**: If a slide introduces code, provide it inside the code block with rich inline comments.

Structure your lesson precisely as follows, streaming each slide progressively:

##TITLE## The lesson title
##OBJECTIVES## Objective 1||Objective 2||Objective 3

Then for each slide, output:
##HEADING## Slide Title
##BULLETS## Bullet point 1||Bullet point 2||Bullet point 3
##DIAGRAM## {"root": {"label": "Root Concept Label"}, "children": [{"label": "Child Concept A"}, {"label": "Child Concept B"}]}
##CODE## language\\ncode block (only if code is relevant to this slide, otherwise omit this block entirely)
##QUIZ## {"question": "A multiple choice question testing this slide's concept", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "The exact correct option string", "explanation": "Detailed explanation why it is correct"}

Cover these slides in order:
1. Slide 1: Introduction & Real-world Motivation (Why this matters)
2. Slide 2: Deep Dive: Core Concepts & Relationships
3. Slide 3: Code Demonstration (If applicable, otherwise detail structure)
4. Slide 4: Pitfalls & Common Mistakes (What to avoid)
5. Slide 5: Action Summary & Hands-on Challenge

Keep diagram node labels short (1-3 words max). Ensure the diagram JSON and quiz JSON are valid and fit the format exactly. Output each slide progressively as you generate.`;
  };

  const fallbackTeaching = (teachTopic: string, lvl: string) => {
    const page1: BoardContentItem[] = [
      { id: generateId(), type: 'heading', content: `Introduction to ${teachTopic}`, isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'bullets', content: `Welcome to our session on ${teachTopic}||We will learn the fundamental concepts step-by-step||This lesson is designed for a ${lvl} level student`, isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'diagram', content: JSON.stringify({
        root: { label: teachTopic },
        children: [
          { label: 'Introduction' },
          { label: 'Core Goals' }
        ]
      }), isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'quiz', content: JSON.stringify({
        question: `What is the primary focus of learning ${teachTopic}?`,
        options: ["Learning step-by-step from first principles", "Rote memorization of codes", "Skipping fundamentals"],
        answer: "Learning step-by-step from first principles",
        explanation: "AURA Learn designs curriculum around step-by-step conceptual mapping and analogies."
      }), isStreaming: false, timestamp: new Date() }
    ];

    const page2: BoardContentItem[] = [
      { id: generateId(), type: 'heading', content: 'Key Conceptual Layout', isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'bullets', content: `Understanding the structural relationships is key||Concepts branch from a central root module||Review the visual connections on the board`, isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'diagram', content: JSON.stringify({
        root: { label: 'System Architecture' },
        children: [
          { label: 'Isolation' },
          { label: 'Interoperability' },
          { label: 'Scalability' }
        ]
      }), isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'quiz', content: JSON.stringify({
        question: "Which pattern maps parent concepts down to branch modules?",
        options: ["Hierarchical tree structure", "Linear sequence chain", "None of these"],
        answer: "Hierarchical tree structure",
        explanation: "A hierarchical tree structure centers around a main concept (parent node) and branches out into specific nodes (children)."
      }), isStreaming: false, timestamp: new Date() }
    ];

    const page3: BoardContentItem[] = [
      { id: generateId(), type: 'heading', content: 'Practice & Summary', isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'bullets', content: `Apply what you've learned to simple exercises||Keep practicing regularly to build muscle memory||Ask questions anytime if you face doubts`, isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'diagram', content: JSON.stringify({
        root: { label: 'Summary Action' },
        children: [
          { label: 'Exercise Practice' },
          { label: 'Conceptual Check' }
        ]
      }), isStreaming: false, timestamp: new Date() },
      { id: generateId(), type: 'quiz', content: JSON.stringify({
        question: "Why should you regularly practice exercises?",
        options: ["To build muscle memory and reinforce core logic", "Only to clear exams", "It is not recommended"],
        answer: "To build muscle memory and reinforce core logic",
        explanation: "Regular practice transforms theoretical rules into code muscle memory, critical for senior engineering success."
      }), isStreaming: false, timestamp: new Date() }
    ];

    if (teachTopic.toLowerCase().includes('python') || teachTopic.toLowerCase().includes('code') || teachTopic.toLowerCase().includes('program')) {
      page2.splice(page2.length - 1, 0, {
        id: generateId(),
        type: 'code',
        content: '# Code Example\ndef main():\n    # System core processing\n    print("System active")\n\nif __name__ == "__main__":\n    main()',
        isStreaming: false,
        timestamp: new Date()
      });
    }

    setLessonTitle(`Learning ${teachTopic}`);
    setObjectives([`Understand ${teachTopic} fundamentals`, `Apply concepts in practice`, `Build confidence with ${lvl} level exercises`]);
    setBoardPages([
      { id: generateId(), pageNumber: 1, items: page1, createdAt: new Date(), downloaded: false },
      { id: generateId(), pageNumber: 2, items: page2, createdAt: new Date(), downloaded: false },
      { id: generateId(), pageNumber: 3, items: page3, createdAt: new Date(), downloaded: false }
    ]);
    setCurrentPage(0);
  };

  const handleDoubtSubmit = useCallback(async () => {
    if (!doubtQuestion.trim()) return;
    setDoubtLoading(true);
    setDoubtAnswer('');

    // Save what's on the board for resume context
    const currentBoardState = currentBoard?.items || [];

    // Pause teaching
    setIsPaused(true);

    try {
      const res = await fetch('/api/v1/agents/public/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `The student is learning about "${lessonTitle || topic}" with a ${teacherId} style teacher. They asked: "${doubtQuestion}"

Current lesson context: ${currentBoardState.map(i => i.type + ': ' + i.content).join('\n')}

Answer their doubt in the style of ${teacher.name} (${teacher.teachingApproach} teacher).
Return as JSON: {"explanation": "clear answer", "codeExample": "code if relevant"}

Keep the explanation focused and helpful. After answering, say "Ready to continue?" to resume the lesson.`,
          system_prompt: teacher.description,
        }),
      });
      const data = await res.json();
      const rawResponse = data?.data?.response || 'I understand your question. Let me explain...';

      let parsed: Record<string, string> = {};
      try {
        parsed = JSON.parse(rawResponse);
      } catch { parsed = { explanation: rawResponse }; }

      const answer = parsed.explanation || rawResponse;
      setDoubtAnswer(answer);

      // Speak the answer
      speakText(answer);

      // Add doubt answer to board as a special text item
      const answerItem: BoardContentItem = {
        id: generateId(),
        type: 'text',
        content: `📝 Doubt: "${doubtQuestion}"\n💡 ${teacher.name}: ${answer}`,
        isStreaming: false,
        timestamp: new Date(),
      };

      setBoardPages(prev => {
        const pages = [...prev];
        const current = { ...pages[pages.length - 1] };
        current.items = [...current.items, answerItem];
        pages[pages.length - 1] = current;
        return pages;
      });

      // Show the code example if any
      const codeExample = parsed.codeExample;
      if (codeExample) {
        setBoardPages(prev => {
          const pages = [...prev];
          const current = { ...pages[pages.length - 1] };
          current.items = [...current.items, {
            id: generateId(), type: 'code', content: codeExample,
            isStreaming: false, timestamp: new Date(),
          }];
          pages[pages.length - 1] = current;
          return pages;
        });
      }
    } catch {
      setDoubtAnswer(`Great question! Let me explain "${doubtQuestion}". The key point is to understand the fundamental concept first, then practice with examples. Ready to continue with the lesson?`);
    } finally {
      setDoubtLoading(false);
      setDoubtQuestion('');
    }
  }, [doubtQuestion, lessonTitle, topic, teacherId, teacher, currentBoard, speakText]);

  const resumeLesson = useCallback(() => {
    setIsPaused(false);
    setShowDoubtPanel(false);
    setDoubtAnswer('');
    setAssistantEmotion('happy');
    setAssistantAnimation('idle');
    // Continue speaking if there's more content
    window.speechSynthesis.cancel();
  }, [setAssistantEmotion, setAssistantAnimation]);

  const downloadBoardPage = useCallback((page: BoardPage) => {
    const content = [
      `# ${lessonTitle || 'Lesson Notes'}`,
      `Page ${page.pageNumber}`,
      `Generated: ${page.createdAt.toLocaleString()}`,
      '',
      ...page.items.map(item => {
        switch(item.type) {
          case 'heading': return `\n## ${item.content}\n`;
          case 'text': return `\n${item.content}\n`;
          case 'code': return `\n\`\`\`\n${item.content}\n\`\`\`\n`;
          default: return item.content;
        }
      }),
      '',
      '---',
      'Generated by AURA Learn AI Teacher',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle || 'lesson'}-page-${page.pageNumber}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lessonTitle]);

  const downloadFullCourse = useCallback(() => {
    const allContent = boardPages.map(page => [
      `# Page ${page.pageNumber}`,
      ...page.items.map(item => {
        switch(item.type) {
          case 'heading': return `\n## ${item.content}\n`;
          case 'text': return `\n${item.content}\n`;
          case 'code': return `\n\`\`\`\n${item.content}\n\`\`\`\n`;
          default: return item.content;
        }
      }),
    ].join('\n'));

    const content = [
      `# ${lessonTitle || 'Full Course Notes'}`,
      `Teacher: ${teacher.name}`,
      `Total Pages: ${boardPages.length}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      ...allContent,
      '',
      '---',
      'Generated by AURA Learn AI Teacher',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle || 'full-course'}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [boardPages, lessonTitle, teacher.name]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setAssistantEmotion('neutral');
    setAssistantAnimation('idle');
  }, [setAssistantEmotion, setAssistantAnimation]);

  // Flying assistant position tracking
  useEffect(() => {
    if (currentItemRef.current && flyingRef.current) {
      const rect = currentItemRef.current.getBoundingClientRect();
      const classroom = classroomRef.current?.getBoundingClientRect();
      if (classroom) {
        flyingRef.current.style.transform = `translate(${rect.left - classroom.left}px, ${rect.top - classroom.top - 40}px)`;
      }
    }
  }, [currentPage, boardPages]);

  const getCanvasStyle = () => {
    switch (canvasTheme) {
      case 'chalk':
        return {
          backgroundColor: '#0b221a',
          backgroundImage: gridPattern === 'none' ? 'none' : 
            gridPattern === 'dots' ? 'radial-gradient(rgba(255, 255, 255, 0.03) 1.5px, transparent 1.5px)' :
            'linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          fontFamily: 'var(--font-patrick), var(--font-caveat), Chalkboard SE, Comic Sans MS, cursive',
        };
      case 'studio':
        return {
          backgroundColor: '#ffffff',
          backgroundImage: gridPattern === 'none' ? 'none' : 
            gridPattern === 'dots' ? 'radial-gradient(rgba(99, 102, 241, 0.04) 1.5px, transparent 1.5px)' :
            'linear-gradient(rgba(99, 102, 241, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.02) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          fontFamily: 'var(--font-caveat), var(--font-patrick), Chalkboard SE, Comic Sans MS, cursive',
        };
      case 'terminal':
        return {
          backgroundColor: '#000000',
          backgroundImage: gridPattern === 'none' ? 'none' : 
            'linear-gradient(rgba(51, 255, 51, 0.02) 2px, transparent 2px)',
          backgroundSize: '100% 4px',
          fontFamily: 'Courier New, Courier, monospace',
        };
      case 'cyber':
      default:
        return {
          backgroundColor: '#060a13',
          backgroundImage: gridPattern === 'none' ? 'none' : 
            gridPattern === 'dots' ? 'radial-gradient(rgba(139, 92, 246, 0.08) 1.5px, transparent 1.5px)' :
            'linear-gradient(rgba(139, 92, 246, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.015) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          fontFamily: 'Inter, sans-serif',
        };
    }
  };

  const getCanvasTextClass = () => {
    switch (canvasTheme) {
      case 'chalk': return 'chalk-text font-chalk';
      case 'studio': return 'text-slate-800 font-whiteboard';
      case 'terminal': return 'text-[#33ff33]';
      case 'cyber':
      default:
        return 'text-slate-100';
    }
  };

  const boardBgStyle = getCanvasStyle();
  const boardText = getCanvasTextClass();

  const renderSlideContent = (items: BoardContentItem[]) => {
    if (!items || items.length === 0) return null;

    const headingItem = items.find(i => i.type === 'heading');
    const bulletsItem = items.find(i => i.type === 'bullets');
    const diagramItem = items.find(i => i.type === 'diagram');
    const codeItem = items.find(i => i.type === 'code');
    const quizItem = items.find(i => i.type === 'quiz');
    const textItems = items.filter(i => i.type === 'text');

    const hasSplitLayout = bulletsItem && diagramItem;

    return (
      <div className="space-y-6 w-full text-left">
        {/* Slide Heading */}
        {headingItem && (
          <motion.div
            key={headingItem.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-white/5 pb-3 mb-6"
          >
            {canvasTheme === 'chalk' ? (
              <h2 className="text-3xl font-bold tracking-tight chalk-text-yellow border-b border-dashed border-yellow-200/20 pb-1 w-full">
                ✨ {headingItem.content}
                {headingItem.isStreaming && <span className="inline-block w-2.5 h-6 ml-1.5 bg-yellow-200 animate-pulse align-middle" />}
              </h2>
            ) : (
              <div className="flex items-center gap-3">
                <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-primary to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] shrink-0" />
                <h2 className={cn('text-2xl font-bold tracking-tight', canvasTheme === 'studio' ? 'text-slate-800' : 'text-white')}>
                  {headingItem.content}
                  {headingItem.isStreaming && <span className="inline-block w-2.5 h-6 ml-1.5 bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)] align-middle" />}
                </h2>
              </div>
            )}
          </motion.div>
        )}

        {/* Main Slide Body Grid */}
        {hasSplitLayout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[380px] w-full">
            {/* Left Column: Bullets */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <ul className="space-y-3 text-left">
                {bulletsItem.content.split('||').map((bullet, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 + 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className={cn('h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 select-none',
                      canvasTheme === 'chalk' ? 'text-cyan-300 font-chalk' : 'text-indigo-400 font-sans'
                    )}>
                      ✦
                    </span>
                    <span className={cn("text-lg leading-relaxed font-semibold", 
                      canvasTheme === 'chalk' ? 'chalk-text' : canvasTheme === 'studio' ? 'text-slate-800 font-whiteboard' : 'text-slate-200'
                    )}>
                      {bullet}
                    </span>
                  </motion.li>
                ))}
              </ul>
              {bulletsItem.isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-2" />
              )}
            </motion.div>

            {/* Right Column: Visual Diagram */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center items-center w-full"
            >
              <ConceptDiagram dataString={diagramItem.content} theme={canvasTheme} />
            </motion.div>
          </div>
        ) : (
          // Non-split Layout fallback (Standard full-width elements rendered one by one)
          <div className="space-y-6 w-full">
            {bulletsItem && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 text-left"
              >
                <ul className="space-y-2">
                  {bulletsItem.content.split('||').map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="h-5 w-5 text-indigo-400 mt-1 font-bold">✦</span>
                      <span className={cn("text-lg leading-relaxed", canvasTheme === 'chalk' ? 'chalk-text' : '')}>
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {diagramItem && (
              <div className="flex justify-center my-6">
                <ConceptDiagram dataString={diagramItem.content} theme={canvasTheme} />
              </div>
            )}
            
            {textItems.map((txt) => (
              <div key={txt.id} className={cn('p-4 rounded-xl', canvasTheme === 'chalk' ? 'chalk-text' : 'text-slate-300')}>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{txt.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Code Projector Screen (if present) */}
        {codeItem && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative my-6 px-1 md:px-4"
          >
            {/* Projector Screen Casing */}
            <div className="h-6 w-full bg-slate-400 rounded-full border border-slate-500 shadow-md flex items-center justify-between px-4 relative z-20 select-none">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <div className="text-[9px] text-slate-700 font-bold tracking-widest uppercase font-mono truncate max-w-[200px] md:max-w-none">
                PROJECTOR SCREEN // {codeItem.content.split('\n')[0].startsWith('#') 
                  ? codeItem.content.split('\n')[0].replace('#', '').trim() 
                  : 'source-code.py'}
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            </div>
            {/* Hanger cords */}
            <div className="flex justify-between px-8 -mt-1 relative z-10 select-none">
              <div className="w-0.5 h-2 bg-slate-500" />
              <div className="w-0.5 h-2 bg-slate-500" />
            </div>
            {/* The Projected Screen Body */}
            <div className="bg-[#f8fafc] border-x-[8px] border-b-[8px] border-slate-300 rounded-b-xl shadow-2xl overflow-hidden relative">
              {/* Light beams projection glow */}
              <div className="absolute inset-0 bg-indigo-500/5 mix-blend-screen pointer-events-none" />
              
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeItem.content);
                    toast.success('Code copied!');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium font-sans"
                >
                  Copy Code
                </button>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto text-slate-800">
                <pre className="whitespace-pre-wrap">{codeItem.content}</pre>
                {codeItem.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse" />}
              </div>
              {/* Screen Pull Ring/Handle */}
              <div className="w-full flex justify-center py-1 bg-slate-200/50 border-t border-slate-200 select-none">
                <div className="w-3 h-3 rounded-full border-2 border-slate-400 flex items-center justify-center cursor-pointer" title="Pull Screen" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Checkpoint Quiz */}
        {quizItem && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border-2 border-dashed border-indigo-500/20 bg-slate-900/60 backdrop-blur-md space-y-4 my-6 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 animate-spin text-primary" /> Checkpoint Challenge
              </span>
              <Badge variant="primary" size="sm">
                +50 XP Reward
              </Badge>
            </div>

            {(() => {
              try {
                let cleaned = quizItem.content.trim();
                if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/```json|```/g, '').trim();
                else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```/g, '').trim();
                
                const quizData = JSON.parse(cleaned);
                const questionId = quizItem.id;
                const isSubmitted = submittedAnswers[questionId];
                const selected = selectedAnswers[questionId];
                const isCorrect = selected === quizData.answer;

                return (
                  <div className="space-y-4">
                    <p className="text-base font-bold text-slate-100">{quizData.question}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {quizData.options.map((opt: string, oIdx: number) => {
                        const isSelected = selected === opt;
                        const isCorrectOpt = opt === quizData.answer;
                        
                        let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300";
                        if (isSelected) {
                          if (isSubmitted) {
                            btnStyle = isCorrect 
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                              : "bg-red-500/20 border-red-500 text-red-300 font-bold";
                          } else {
                            btnStyle = "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold";
                          }
                        } else if (isSubmitted && isCorrectOpt) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold";
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isSubmitted}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [questionId]: opt }))}
                            className={cn("p-3 rounded-xl border text-sm text-left transition-all duration-300", btnStyle)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {!isSubmitted ? (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!selected}
                        onClick={() => {
                          setSubmittedAnswers(prev => ({ ...prev, [questionId]: true }));
                          handleQuizAnswer(isCorrect, lessonTitle || topic, selected);
                        }}
                        className="w-full h-9 font-bold"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn("p-4 rounded-xl text-xs space-y-1.5 leading-relaxed", 
                          isCorrect ? "bg-emerald-500/5 text-emerald-400" : "bg-red-500/5 text-red-400"
                        )}
                      >
                        <p className="font-bold uppercase tracking-wider text-[10px]">
                          {isCorrect ? "🎉 Correct!" : "❌ Try Again Next Time"}
                        </p>
                        <p className="text-slate-300">{quizData.explanation}</p>
                        {isPaused && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={resumeLesson}
                            className="mt-3 h-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                          >
                            Continue Lecture
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              } catch (e) {
                return (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    <span>Streaming checkpoint question...</span>
                  </div>
                );
              }
            })()}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="flex items-center gap-1.5"
              >
                <Settings className="h-4 w-4" />
                Board Config
              </Button>
              
              {showSettingsPanel && (
                <div className="absolute top-10 left-0 w-80 bg-[#0c101d] border border-white/10 rounded-2xl p-5 shadow-2xl z-50 space-y-4 text-white font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-bold text-sm text-primary flex items-center gap-1">
                      <Settings className="h-4.5 w-4.5" /> Engine Settings
                    </span>
                    <button onClick={() => setShowSettingsPanel(false)} className="hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Theme Selector */}
                  <div className="space-y-2">
                    <span className="font-semibold block text-slate-400">Canvas Theme</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cyber', name: '🌌 Cyber Neon' },
                        { id: 'chalk', name: '🏫 Classic Chalk' },
                        { id: 'studio', name: '🎨 Tech Studio' },
                        { id: 'terminal', name: '📟 Retro Terminal' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setCanvasTheme(t.id as any)}
                          className={cn("p-2 rounded-xl text-center border font-semibold transition-all",
                            canvasTheme === t.id 
                              ? "bg-primary border-primary text-white" 
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid Selector */}
                  <div className="space-y-2">
                    <span className="font-semibold block text-slate-400">Grid Pattern</span>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                      {[
                        { id: 'cyber', name: 'Cyber' },
                        { id: 'dots', name: 'Dots' },
                        { id: 'lines', name: 'Lines' },
                        { id: 'none', name: 'None' }
                      ].map(g => (
                        <button
                          key={g.id}
                          onClick={() => setGridPattern(g.id as any)}
                          className={cn("p-1.5 rounded-lg border transition-all",
                            gridPattern === g.id 
                              ? "bg-primary border-primary text-white" 
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                          )}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Focus Ambient Noise */}
                  <div className="space-y-2">
                    <span className="font-semibold block text-slate-400">Ambient Background Audio</span>
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                      {[
                        { id: 'off', name: 'Mute' },
                        { id: 'lofi', name: 'Lo-Fi' },
                        { id: 'rain', name: 'Rain' },
                        { id: 'coffee', name: 'Cafe' }
                      ].map(a => (
                        <button
                          key={a.id}
                          onClick={() => setAmbientAudio(a.id as any)}
                          className={cn("p-1.5 rounded-lg border transition-all",
                            ambientAudio === a.id 
                              ? "bg-primary border-primary text-white" 
                              : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                          )}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speech Rate Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold">Speech speed:</span>
                      <span className="font-bold text-white">{voiceSpeed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1" 
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowConceptMap(!showConceptMap)} title="Toggle Concept Map">
              <BookOpen className="h-4 w-4 mr-2" />
              Roadmap
            </Button>
            <Badge variant="primary" size="sm" dot>
              {isGenerating ? `${teacher.name} is teaching...` : `${teacher.name} is ready`}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-accent/30 rounded-full px-3 py-1">
              <Quote className="h-3 w-3" />
              {teacher.name} · {teacher.teachingApproach}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as typeof level)}
              className="h-7 px-2 rounded border border-input bg-background text-xs"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={selectedVoiceGender}
              onChange={(e) => setSelectedVoiceGender(e.target.value as 'female' | 'male')}
              className="h-7 px-2 rounded border border-input bg-background text-xs font-medium"
            >
              <option value="female">🔊 Sweet Female Voice</option>
              <option value="male">🔊 Sweet Male Voice</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDashboard(!showDashboard)}
              className={cn("flex items-center gap-1 h-7 text-xs font-semibold px-2.5 rounded border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400")}
              title="Show Analytics Dashboard"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Button>
            
            <div className="h-5 w-px bg-border/80 mx-1 select-none" />

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowConceptMap(!showConceptMap)}
              title="Toggle Concept Roadmap"
              className={cn("h-7 w-7", showConceptMap && "text-primary bg-primary/10")}
            >
              <BookOpen className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'doubt' ? null : 'doubt')}
              title="Toggle AI Chat Doubt"
              className={cn("h-7 w-7", activeSidebarTab === 'doubt' && "text-primary bg-primary/10")}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'notes' ? null : 'notes')}
              title="Toggle Notes Compiler"
              className={cn("h-7 w-7", activeSidebarTab === 'notes' && "text-primary bg-primary/10")}
            >
              <FileText className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'timer' ? null : 'timer')}
              title="Toggle Pomodoro Timer"
              className={cn("h-7 w-7", activeSidebarTab === 'timer' && "text-primary bg-primary/10")}
            >
              <Clock className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveSidebarTab(activeSidebarTab === 'calendar' ? null : 'calendar')}
              title="Toggle Study Calendar"
              className={cn("h-7 w-7", activeSidebarTab === 'calendar' && "text-primary bg-primary/10")}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setIsWideView(!isWideView);
                if (!isWideView) {
                  setShowConceptMap(false);
                }
              }}
              title="Toggle Wide Lecture Board"
              className={cn("h-7 w-7", isWideView && "text-primary bg-primary/10")}
            >
              {isWideView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4 rotate-45" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="h-7 w-7">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Live Diagnostics/Telemetry bar */}
        <div className="flex items-center justify-between px-6 py-1.5 bg-[#070b13] border-b border-white/[0.03] text-[10px] text-slate-400 tracking-wider uppercase font-mono select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
              <span>Session: <span className="text-emerald-400 font-semibold">Active</span></span>
            </div>
            <div>
              <span>AI Teacher: <span className="text-purple-400 font-semibold">{teacher.name} ({teacher.teachingApproach})</span></span>
            </div>
            <div>
              <span>Audio Feed: <span className="text-blue-400 font-semibold">{selectedVoiceGender === 'female' ? 'Female (Sweet)' : 'Male (Sweet)'}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span>Cognitive Stream:</span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000", isGenerating ? "w-[85%]" : "w-[5%]")} 
                />
              </div>
              <span className="text-[9px] font-semibold text-slate-300">{isGenerating ? "Processing" : "Standby"}</span>
            </div>
            <div>
              <span>Connection: <span className="text-emerald-400 font-semibold">Secure SSL</span></span>
            </div>
          </div>
        </div>

        {/* Main Classroom */}
        <div ref={classroomRef} className="flex-1 flex overflow-hidden relative">
          {/* Collapsible Left Concept Map */}
          {showConceptMap && !isWideView && (
            <div className={cn("hidden md:flex flex-col w-64 border-r p-4 space-y-5 overflow-y-auto transition-all duration-300 shrink-0", 
              boardStyle === 'whiteboard' ? 'bg-slate-50 border-slate-200' : 'bg-[#0b0f19] border-white/5 text-white'
            )}>
              <div className="flex items-center justify-between border-b pb-3 border-border/40">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Concept Roadmap</span>
                  {boardPages.length > 0 && (
                    <span className="text-[9px] text-indigo-400 font-mono mt-0.5">
                      Progress: {Math.round(((currentPage + 1) / boardPages.length) * 100)}%
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowConceptMap(false)} className="h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Progress bar */}
              {boardPages.length > 0 && (
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${((currentPage + 1) / boardPages.length) * 100}%` }}
                  />
                </div>
              )}
              
              {/* Objective Checklist */}
              {objectives.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> Targets
                  </span>
                  <div className="space-y-2">
                    {objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs leading-normal text-slate-300">
                        <span className="h-4 w-4 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-[9px] shrink-0">
                          {i + 1}
                        </span>
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Blackboard Outline */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <BookOpen className="h-3 w-3" /> Board Outline
                </span>
                <div className="space-y-3">
                  {boardPages.map((page, pIdx) => {
                    const isCompleted = pIdx < currentPage;
                    const isCurrent = pIdx === currentPage;
                    
                    return (
                      <div key={page.id} className="space-y-1 relative pl-6 border-l border-white/5 last:border-0 ml-2">
                        {/* Interactive state markers */}
                        <div className="absolute left-[-9px] top-0.5">
                          {isCompleted ? (
                            <span className="h-4.5 w-4.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] font-bold" title="Completed">
                              ✓
                            </span>
                          ) : isCurrent ? (
                            <span className="h-4.5 w-4.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 flex items-center justify-center text-[9px] font-black animate-pulse" title="Teaching...">
                              ●
                            </span>
                          ) : (
                            <span className="h-4.5 w-4.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center text-[8px] font-mono" title="Locked">
                              {pIdx + 1}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <span>Board Page {page.pageNumber}</span>
                          </div>
                          <div className="space-y-1">
                            {page.items.filter(item => item.type === 'heading').map((item) => (
                              <div 
                                key={item.id} 
                                onClick={() => scrollToSection(pIdx)}
                                className={cn(
                                  "text-[11px] cursor-pointer truncate transition-all py-0.5 font-medium",
                                  isCurrent ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-indigo-300"
                                )}
                              >
                                {item.content}
                              </div>
                            ))}
                            {page.items.filter(item => item.type === 'heading').length === 0 && (
                              <span className="text-[10px] italic text-slate-500">Introductory section</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Left Teacher stage */}
          <div className={cn("hidden flex-col items-center justify-end w-52 p-4 border-r border-border shrink-0 bg-gradient-to-b from-[#0e1422] to-[#080b13] relative overflow-hidden select-none transition-all duration-500", isWideView ? "lg:hidden" : "lg:flex")}>
            {/* Spot light shine overlay */}
            <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent pointer-events-none z-10" 
                 style={{ clipPath: 'polygon(50% 0%, 25% 100%, 75% 100%)' }} />
            
            {/* Stage details */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_0)] bg-[size:10px_10px]" />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-amber-950/10 border-t border-white/[0.02]" />
            
            {/* Hanging lamp */}
            <div className="absolute top-0 w-0.5 h-16 bg-neutral-600 flex items-end justify-center">
              <div className="w-6 h-3 bg-neutral-500 rounded-b-full shadow-[0_4px_12px_rgba(251,191,36,0.5)] animate-pulse" />
            </div>

            {/* Glowing chalkboard halo backdrop for the teacher */}
            <div className={cn(
              "absolute rounded-full filter blur-2xl opacity-20 z-0 w-36 h-36 bottom-20 transition-all duration-700",
              isSpeakingLesson ? "bg-indigo-500/50 scale-110" : "bg-purple-500/30 scale-100"
            )} />

            {/* Floating pointer wand */}
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute top-14 right-6 text-xl pointer-events-none select-none opacity-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              title="Teacher Pointer"
            >
              🪄
            </motion.div>

            {/* Teacher Avatar */}
            <TeacherAvatar
              styleId={teacher.id}
              state={isGenerating ? 'speaking' : isSpeakingLesson ? 'speaking' : isPaused ? 'thinking' : 'idle'}
              isFemale={selectedVoiceGender === 'female'}
              className="w-40 h-40 mb-16 z-20"
            />

            {/* Podium (Polished dark mahogany wood with gold metal accents) */}
            <div className="absolute bottom-0 w-36 h-20 bg-gradient-to-b from-amber-900 to-amber-950 border-x-2 border-t-2 border-amber-950 rounded-t-2xl shadow-2xl flex flex-col items-center p-2 z-10 ring-1 ring-yellow-500/20">
              <div className="w-full h-1 bg-yellow-500/40 rounded-full" />
              <div className="text-[10px] text-amber-100 font-bold uppercase mt-1.5 select-none truncate max-w-full font-sans tracking-wide">
                {teacher.name}
              </div>
              
              {/* Responsive Audio Waveform */}
              {isSpeakingLesson ? (
                <div className="flex items-end justify-center gap-0.5 h-3 mt-1.5 w-16 select-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: [2, Math.random() * 8 + 4, 2],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.35 + i * 0.08,
                        ease: 'easeInOut',
                      }}
                      className="w-0.5 bg-yellow-400 rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 mt-1 select-none">
                  <span className="text-xs" title="Coffee">☕</span>
                  <span className="text-xs" title="Apple">🍎</span>
                  <span className="text-xs" title="Notebook">📚</span>
                </div>
              )}
            </div>
          </div>

          {/* Whiteboard Area */}
          <div className={cn('flex-1 relative flex flex-col p-4 md:p-6 bg-slate-950 bg-gradient-to-b from-[#162032] to-[#0b101a] overflow-hidden', activeSidebarTab ? 'lg:w-2/3' : 'w-full')}>
            {/* The Chalkboard/Whiteboard 3D Hanging Frame */}
            <div className={cn(
              "relative flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 border-t border-white/5",
              canvasTheme === 'chalk' && 'border-[16px] border-amber-900 ring-8 ring-amber-950/30 ring-offset-2 ring-offset-amber-950',
              canvasTheme === 'cyber' && (
                highlightColor === 'yellow' ? 'border-4 border-yellow-500/50 shadow-[0_0_35px_rgba(234,179,8,0.4)]' :
                highlightColor === 'red' ? 'border-4 border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.4)]' :
                highlightColor === 'cyan' ? 'border-4 border-cyan-500/50 shadow-[0_0_35px_rgba(34,211,238,0.4)]' :
                highlightColor === 'white' ? 'border-4 border-slate-100/50 shadow-[0_0_30px_rgba(255,255,255,0.25)]' :
                'border-4 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.25)]'
              ),
              canvasTheme === 'studio' && 'border-[14px] border-slate-300 ring-4 ring-slate-400/10',
              canvasTheme === 'terminal' && 'border-[18px] border-zinc-800 rounded-3xl'
            )}>
              {/* Board Canvas background */}
              <div className="flex-1 overflow-y-auto scrollbar-thin relative p-4 md:p-8" style={boardBgStyle}>
                <div className={cn('mx-auto space-y-6 min-h-full transition-all duration-500', 
                  isWideView ? 'max-w-none w-full px-2 py-2 md:px-6' : 'max-w-4xl'
                , boardText)}>
                  {/* Topic Input (shown when no lesson) */}
                  {boardPages.every(p => p.items.length === 0) && !isGenerating && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6">
                      <div className="text-center space-y-3">
                        <div className={cn('h-20 w-20 rounded-full flex items-center justify-center mx-auto', canvasTheme === 'studio' ? 'bg-primary/10' : 'bg-white/10')}>
                          <BookOpen className={cn('h-10 w-10', canvasTheme === 'studio' ? 'text-primary' : 'text-white')} />
                        </div>
                        <h2 className={cn('text-2xl font-bold', canvasTheme === 'chalk' ? 'chalk-text' : canvasTheme === 'studio' ? 'text-slate-800' : 'text-white')}>
                          Your {teacher.name} is ready to teach!
                        </h2>
                        <p className={cn(canvasTheme === 'chalk' ? 'chalk-text opacity-70' : 'text-muted-foreground', 'max-w-md')}>
                          {teacher.tagline}
                        </p>
                        {course && (
                          <div className="bg-accent/30 rounded-xl p-4 max-w-md mx-auto">
                            <p className="font-medium">Course: {course.title}</p>
                            <p className="text-sm text-muted-foreground">Level: {course.level} · {course.totalLessons} lessons</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 w-full max-w-lg">
                        <Input
                          value={inputTopic}
                          onChange={(e) => setInputTopic(e.target.value)}
                          placeholder="e.g., Python Variables, React Hooks, Machine Learning..."
                          className="flex-1"
                          onKeyDown={(e) => e.key === 'Enter' && generateLesson()}
                        />
                        <Button variant="primary" onClick={generateLesson} disabled={!inputTopic.trim()}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Teach
                        </Button>
                      </div>
                      {!course && !topicParam && (
                        <p className="text-xs text-muted-foreground">
                          No course selected? Just type any topic above to start learning instantly!
                        </p>
                      )}
                    </div>
                  )}

                  {/* Laser Pointer dot */}
                  {isSpeakingLesson && (
                    <motion.div
                      animate={{
                        x: [20, 160, 45, 240, 20],
                        y: [80, 160, 220, 110, 80],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 11,
                        ease: 'easeInOut',
                      }}
                      className="absolute h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_4px_rgba(239,68,68,0.8)] z-40 pointer-events-none"
                    />
                  )}

                  {/* Continuous Scroll Board Content rendering */}
                  {boardPages.some(p => p.items.length > 0) ? (
                    <div className="space-y-12">
                      {boardPages.map((page, index) => {
                        if (page.items.length === 0) return null;
                        return (
                          <div 
                            key={page.id} 
                            data-section={index}
                            className="relative pb-10 border-b border-dashed border-white/10 last:border-b-0 last:pb-0"
                          >
                            <div className="absolute top-[-10px] right-2 text-[9px] font-mono text-slate-500 opacity-60 uppercase tracking-wider select-none">
                              Section {index + 1}
                            </div>
                            {renderSlideContent(page.items)}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    lessonTitle && (
                      <div className="space-y-6">
                        <div className="space-y-4 border-b border-white/5 pb-4">
                          <div className="flex items-center justify-between">
                            <h1 className={cn('text-4xl font-bold tracking-tight', canvasTheme === 'chalk' ? 'chalk-text-yellow' : canvasTheme === 'studio' ? 'text-slate-800' : 'text-white')}>
                              {lessonTitle}
                            </h1>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground bg-accent/30 px-2 py-1 rounded">
                                Board Setup Complete
                              </span>
                            </div>
                          </div>
                        </div>

                        {objectives.length > 0 && (
                          <div className={cn('p-6 rounded-2xl', 
                            canvasTheme === 'chalk'
                              ? 'bg-white/[0.02] border border-white/[0.04]'
                              : canvasTheme === 'studio' ? 'bg-slate-50 border border-slate-100 shadow-sm' : 'bg-white/5'
                          )}>
                            <h2 className={cn("text-xl font-semibold mb-4", canvasTheme === 'chalk' ? 'chalk-text-cyan' : '')}>Learning Objectives</h2>
                            <ul className="space-y-3">
                              {objectives.map((obj, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className={cn('h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                                    canvasTheme === 'chalk'
                                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                      : canvasTheme === 'studio' ? 'bg-indigo-50 text-indigo-600' : 'bg-primary/20 text-primary'
                                  )}>{i + 1}</span>
                                  <span className={canvasTheme === 'chalk' ? 'chalk-text' : ''}>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {/* Board navigation dots */}
                  {boardPages.length > 1 && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      {boardPages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => scrollToSection(i)}
                          className={cn('h-2 rounded-full transition-all', i === currentPage ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30')}
                        />
                      ))}
                    </div>
                  )}

                  {/* Generating indicator */}
                  {isGenerating && (
                    <div className={cn("flex items-center gap-3 py-4", canvasTheme === 'chalk' ? 'chalk-text opacity-70' : 'text-muted-foreground')}>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{teacher.name} is teaching...</span>
                    </div>
                  )}

                  {/* Paused for doubt */}
                  {isPaused && doubtAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn('p-6 rounded-2xl border-2', canvasTheme === 'chalk'
                        ? 'bg-yellow-500/10 border-yellow-500/30 text-slate-100 font-chalk'
                        : canvasTheme === 'studio'
                          ? 'bg-yellow-50 border-yellow-200 text-slate-800'
                          : 'bg-yellow-500/10 border-yellow-500/30 text-slate-100'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                          <MessageSquare className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <p className="font-medium">{teacher.name} answered your doubt:</p>
                          <p className="text-sm whitespace-pre-wrap">{doubtAnswer}</p>
                          <Button variant="primary" size="sm" onClick={resumeLesson}>
                            <Play className="h-4 w-4 mr-1" />
                            Ready, Continue Lesson
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={boardEndRef} />
                </div>
              </div>

              {/* Chalk / Marker Tray Ledge */}
              {canvasTheme === 'chalk' && (
                <div className="h-5 w-full bg-amber-800 border-t border-amber-950 flex items-center justify-center gap-10 px-6 shadow-md relative z-10 shrink-0 select-none">
                  {/* Virtual Chalk sticks and Eraser resting on the tray */}
                  <div className="flex items-center gap-3">
                    <span 
                      onClick={() => { setHighlightColor('white'); toast('Selected White Chalk stick', { icon: '🖍️' }); }}
                      className={cn("w-8 h-2 bg-white rounded-sm rotate-12 shadow-sm opacity-90 cursor-pointer transition-all duration-300", 
                        highlightColor === 'white' ? "translate-y-[-5px] scale-110 ring-2 ring-yellow-400" : "translate-y-[-2px] hover:translate-y-[-4px]"
                      )} 
                      title="White Chalk" 
                    />
                    <span 
                      onClick={() => { setHighlightColor('yellow'); toast('Selected Yellow Chalk stick', { icon: '🖍️' }); }}
                      className={cn("w-7 h-2 bg-yellow-200 rounded-sm -rotate-6 shadow-sm opacity-90 cursor-pointer transition-all duration-300", 
                        highlightColor === 'yellow' ? "translate-y-[-4px] scale-110 ring-2 ring-yellow-400" : "translate-y-[-1px] hover:translate-y-[-3px]"
                      )} 
                      title="Yellow Chalk" 
                    />
                    <span 
                      onClick={() => { setHighlightColor('cyan'); toast('Selected Blue Chalk stick', { icon: '🖍️' }); }}
                      className={cn("w-8 h-2 bg-cyan-200 rounded-sm rotate-6 shadow-sm opacity-90 cursor-pointer transition-all duration-300", 
                        highlightColor === 'cyan' ? "translate-y-[-5px] scale-110 ring-2 ring-cyan-400" : "translate-y-[-2px] hover:translate-y-[-4px]"
                      )} 
                      title="Blue Chalk" 
                    />
                  </div>
                  {/* Eraser */}
                  <div 
                    onClick={() => { setHighlightColor('indigo'); toast('Erased board selection highlight', { icon: '🧼' }); }}
                    className="w-16 h-3 bg-neutral-700 rounded-sm border border-neutral-800 shadow-sm flex flex-col justify-between hover:translate-y-[-2px] cursor-pointer transition-transform" 
                    title="Board Eraser"
                  >
                    <div className="h-1 bg-amber-600 rounded-t-sm" />
                    <div className="h-1 bg-neutral-500" />
                  </div>
                </div>
              )}
              {canvasTheme === 'studio' && (
                <div className="h-5 w-full bg-slate-300 border-t border-slate-400 flex items-center justify-center gap-10 px-6 shadow-md relative z-10 shrink-0 select-none">
                  <div className="flex items-center gap-4">
                    <span 
                      onClick={() => { setHighlightColor('indigo'); toast('Selected Black Marker stick', { icon: '🖊️' }); }}
                      className={cn("w-10 h-2 bg-black rounded-full rotate-6 shadow-sm cursor-pointer transition-all duration-300", 
                        highlightColor === 'indigo' ? "translate-y-[-5px] scale-110 ring-2 ring-white/50" : "translate-y-[-2px] hover:translate-y-[-4px]"
                      )} 
                      title="Black Marker" 
                    />
                    <span 
                      onClick={() => { setHighlightColor('cyan'); toast('Selected Blue Marker stick', { icon: '🖊️' }); }}
                      className={cn("w-10 h-2 bg-blue-600 rounded-full -rotate-12 shadow-sm cursor-pointer transition-all duration-300", 
                        highlightColor === 'cyan' ? "translate-y-[-4px] scale-110 ring-2 ring-cyan-300" : "translate-y-[-1px] hover:translate-y-[-3px]"
                      )} 
                      title="Blue Marker" 
                    />
                    <span 
                      onClick={() => { setHighlightColor('red'); toast('Selected Red Marker stick', { icon: '🖊️' }); }}
                      className={cn("w-10 h-2 bg-red-600 rounded-full rotate-12 shadow-sm cursor-pointer transition-all duration-300", 
                        highlightColor === 'red' ? "translate-y-[-5px] scale-110 ring-2 ring-red-400" : "translate-y-[-2px] hover:translate-y-[-4px]"
                      )} 
                      title="Red Marker" 
                    />
                  </div>
                  <div 
                    onClick={() => { setHighlightColor('indigo'); toast('Erased board selection highlight', { icon: '🧼' }); }}
                    className="wood-grain w-14 h-3 bg-neutral-800 rounded-sm border border-slate-900 shadow-sm hover:translate-y-[-2px] cursor-pointer transition-transform" 
                    title="Whiteboard Eraser" 
                  />
                </div>
              )}
              {canvasTheme === 'cyber' && (
                <div className="h-4 w-full bg-indigo-950/40 border-t border-indigo-900/50 flex items-center justify-between px-6 shadow-md relative z-10 shrink-0 text-[8px] font-mono text-indigo-400/80 uppercase tracking-widest select-none">
                  <span>HOLO-BUFFER DEPLOYED</span>
                  <span>SYSTEM: SECURE TELEMETRY</span>
                </div>
              )}
            </div>

            {/* Flying Assistant */}
            <div
              ref={flyingRef}
              className="absolute transition-all duration-700 ease-in-out z-50 pointer-events-none"
              style={{ transitionProperty: 'transform' }}
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 shadow-lg"
              >
                <div className={cn('h-6 w-6 rounded-full flex items-center justify-center', `bg-${teacher.color}`, 'bg-primary')}>
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                {currentSection && (
                  <span className="text-xs text-muted-foreground max-w-[150px] truncate">{currentSection}</span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Unified Sidebar Workspace */}
          <AnimatePresence>
            {activeSidebarTab && !isWideView && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '33.333%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className={cn("hidden lg:block border-l border-border bg-card overflow-hidden transition-all duration-300", 
                  boardStyle === 'whiteboard' ? 'bg-slate-50 border-slate-200' : 'bg-[#0c101d] border-white/5 text-white'
                )}
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      {activeSidebarTab === 'doubt' && <MessageSquare className="h-4 w-4 text-primary" />}
                      {activeSidebarTab === 'notes' && <FileText className="h-4 w-4 text-primary" />}
                      {activeSidebarTab === 'timer' && <Clock className="h-4 w-4 text-primary" />}
                      {activeSidebarTab === 'calendar' && <CalendarIcon className="h-4 w-4 text-primary" />}
                      <span className="font-medium">
                        {activeSidebarTab === 'doubt' && `Ask ${teacher.name}`}
                        {activeSidebarTab === 'notes' && 'Class Notes'}
                        {activeSidebarTab === 'timer' && 'Study Timer'}
                        {activeSidebarTab === 'calendar' && 'Study Calendar'}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setActiveSidebarTab(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                    {activeSidebarTab === 'doubt' && (
                      <div className="h-full flex flex-col justify-between space-y-4 text-xs font-sans">
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin text-left">
                          {doubtAnswer && (
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {doubtAnswer}
                            </div>
                          )}
                          {doubtLoading && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                              <span>{teacher.name} is thinking...</span>
                            </div>
                          )}
                          {!doubtAnswer && !doubtLoading && (
                            <div className="text-center py-8 text-slate-500">
                              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                              <p>Ask a doubt regarding the lecture and receive first-principles answers.</p>
                            </div>
                          )}
                        </div>
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={doubtQuestion}
                              onChange={(e) => setDoubtQuestion(e.target.value)}
                              placeholder="Type doubt..."
                              className="h-9 text-xs"
                              onKeyDown={(e) => e.key === 'Enter' && handleDoubtSubmit()}
                            />
                            <Button variant="primary" size="icon" onClick={handleDoubtSubmit} isLoading={doubtLoading} className="h-9 w-9 shrink-0">
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                            <button
                              onClick={isListeningVoice ? stopVoiceRecognition : startVoiceRecognition}
                              className={cn(
                                "h-9 w-9 rounded-xl border flex items-center justify-center transition-all shrink-0",
                                isListeningVoice 
                                  ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                                  : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                              )}
                              title="Voice Mode Doubt"
                            >
                              <span className="text-sm">🎙️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSidebarTab === 'notes' && (
                      <NotesGenerator 
                        boardPages={boardPages} 
                        topic={lessonTitle || topic || 'Lecture Topic'} 
                        className="border-none bg-transparent backdrop-blur-none p-0"
                      />
                    )}

                    {activeSidebarTab === 'timer' && (
                      <PomodoroTimer className="border-none bg-transparent backdrop-blur-none p-0" />
                    )}

                    {activeSidebarTab === 'calendar' && (
                      <CalendarIntegration />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="flex gap-2 w-full max-w-md">
              <Input
                value={inputTopic}
                onChange={(e) => setInputTopic(e.target.value)}
                placeholder="Enter any topic to learn..."
                className="h-9 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && generateLesson()}
              />
              {isGenerating ? (
                <Button variant="destructive" size="sm" onClick={stopGeneration}>
                  <StopCircle className="h-4 w-4 mr-1" /> Stop
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={generateLesson} disabled={!inputTopic.trim()}>
                  <Sparkles className="h-4 w-4 mr-1" /> {course ? 'Teach Course' : 'Teach'}
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => {
              if (isSpeakingLesson) stopSpeaking();
              else {
                const text = currentBoard?.items.filter(i => i.type === 'text').map(i => i.content).join('. ');
                if (text) speakText(text);
              }
            }}>
              {isSpeakingLesson ? <VolumeX className="h-4 w-4 mr-1" /> : <Volume2 className="h-4 w-4 mr-1" />}
              {isSpeakingLesson ? 'Mute' : 'Voice'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveSidebarTab(activeSidebarTab === 'doubt' ? null : 'doubt')} className={cn(activeSidebarTab === 'doubt' && "text-primary bg-primary/10")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Doubt
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveSidebarTab(activeSidebarTab === 'notes' ? null : 'notes')} className={cn(activeSidebarTab === 'notes' && "text-primary bg-primary/10")}>
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </Button>
          </div>
        </div>
      </div>

      {showDashboard && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans text-white">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl relative"
          >
            <button
              onClick={() => setShowDashboard(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all z-[100] hover:scale-105"
            >
              <X className="h-5 w-5" />
            </button>
            <StudentDashboard
              level={level}
              xpPoints={xpPoints}
              weakTopics={weakTopics}
              quizHistory={quizHistory}
            />
          </motion.div>
        </div>
      )}
    </main>
  );
}