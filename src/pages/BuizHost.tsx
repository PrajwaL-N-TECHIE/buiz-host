import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Play, Trophy, Copy, CheckCircle2, Target, StopCircle, Plus, Lock, Trash2, Save, Eye, EyeOff, Zap, Clock, Grid3X3, ArrowLeft, Download, FileSpreadsheet, FileText, Search, ChevronDown, ChevronUp, Award, RotateCcw, BarChart3, Sliders, Check, ChevronRight, Sparkles, Edit3, LogOut } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { doc, setDoc, onSnapshot, collection, updateDoc, getDocs, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { QUESTIONS } from '@/data/questions';
import { toast } from "sonner";
import { downloadLeaderboardCSV, downloadLeaderboardPDF, calculatePlayerStats } from '@/utils/quizReports';

interface CustomQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  difficulty: string;
  topic: string;
  points?: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  progress: number;
  avatar?: string;
  currentQIndex?: number;
  answers?: { [questionIdx: string]: { selectedOption: number; isCorrect: boolean; timeLeft?: number; earnedPoints?: number } };
}

const BuizHost = () => {
  const [pin, setPin] = useState<string | null>(null);
  const [status, setStatus] = useState<'login' | 'setup' | 'configure' | 'waiting' | 'playing' | 'finished'>('login');
  const [players, setPlayers] = useState<Player[]>([]);
  const [copied, setCopied] = useState(false);

  // Host Paced Game State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<'answering' | 'revealed'>('answering');
  const [roomQuestions, setRoomQuestions] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(20);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Host config state
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number | string>>(new Set());
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [podiumPhase, setPodiumPhase] = useState<0 | 1 | 2 | 3>(0); // 0=none, 1=3rd, 2=2nd, 3=1st
  const [gameMode, setGameMode] = useState<'hostPaced' | 'ownPace'>('hostPaced');

  // Question Points State
  const [cqPoints, setCqPoints] = useState<number>(1000);
  const [questionPointsMap, setQuestionPointsMap] = useState<{ [id: string | number]: number }>({});
  const [defaultPointsOption, setDefaultPointsOption] = useState<'standard' | 'byDifficulty' | 'highStakes' | 'custom'>('standard');

  // Finished Screen View State
  const [finishedTab, setFinishedTab] = useState<'podium' | 'leaderboard'>('podium');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [showQuestionMatrix, setShowQuestionMatrix] = useState(false);
  const [isExporting, setIsExporting] = useState<'csv' | 'pdf' | null>(null);
  const [hostPageLimit, setHostPageLimit] = useState<number>(25);
  const [lobbySearch, setLobbySearch] = useState<string>('');

  // Custom Q Form State
  const [cqText, setCqText] = useState('');
  const [cqOptions, setCqOptions] = useState(['', '', '', '']);
  const [cqAnswer, setCqAnswer] = useState(0);

  // Saved Quizzes & History State
  const [quizName, setQuizName] = useState('');
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([]);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [setupTab, setSetupTab] = useState<'saved' | 'history'>('saved');

  // Check existing Host authentication on mount (Session storage + Supabase Auth)
  useEffect(() => {
    if (sessionStorage.getItem('buiz_host_auth') === 'true') {
      setStatus('setup');
      return;
    }
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          sessionStorage.setItem('buiz_host_auth', 'true');
          setStatus('setup');
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!pin) return;

    if (isSupabaseConfigured) {
      const fetchSupabasePlayers = async () => {
        const { data, error } = await supabase
          .from('buiz_players')
          .select('*')
          .eq('room_pin', pin)
          .order('score', { ascending: false });

        if (!error && data) {
          const playersData: Player[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            score: p.score || 0,
            streak: p.streak || 0,
            progress: Number(p.progress) || 0,
            avatar: p.avatar,
            currentQIndex: p.current_q_index,
            answers: p.answers || {}
          }));
          setPlayers(playersData);
        }
      };

      fetchSupabasePlayers();

      // Debounce timer so 500 simultaneous answers don't fire 500 SELECT queries
      let debounceTimer: any = null;
      const scheduleFullSync = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          fetchSupabasePlayers();
        }, 600);
      };

      const channel = supabase
        .channel(`buiz_host_players_${pin}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'buiz_players', filter: `room_pin=eq.${pin}` },
          (payload: any) => {
            // Instant in-memory state update for immediate 60fps UI responsiveness
            if (payload.new && (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT')) {
              const updated = payload.new;
              setPlayers(prev => {
                const idx = prev.findIndex(p => p.id === updated.id);
                const mappedPlayer: Player = {
                  id: updated.id,
                  name: updated.name,
                  score: updated.score || 0,
                  streak: updated.streak || 0,
                  progress: Number(updated.progress) || 0,
                  avatar: updated.avatar,
                  currentQIndex: updated.current_q_index,
                  answers: updated.answers || {}
                };
                let next;
                if (idx >= 0) {
                  next = [...prev];
                  next[idx] = mappedPlayer;
                } else {
                  next = [...prev, mappedPlayer];
                }
                return next.sort((a, b) => b.score - a.score);
              });
            } else if (payload.old && payload.eventType === 'DELETE') {
              setPlayers(prev => prev.filter(p => p.id !== payload.old.id));
            }
            // Schedule debounced full fetch to ensure eventual consistency
            scheduleFullSync();
          }
        )
        .subscribe();

      return () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        supabase.removeChannel(channel);
      };
    }

    // Fallback: Firestore
    const unsubscribe = onSnapshot(collection(db, `buiz_rooms/${pin}/players`), (snapshot) => {
      const playersData: Player[] = [];
      snapshot.forEach((doc) => {
        playersData.push({ id: doc.id, ...doc.data() } as Player);
      });
      // Sort by score for leaderboard
      playersData.sort((a, b) => b.score - a.score);
      setPlayers(playersData);
    });

    return () => unsubscribe();
  }, [pin]);

  const syncRoomUpdate = async (updates: any) => {
    if (!pin) return;
    if (isSupabaseConfigured) {
      const sbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.status !== undefined) sbUpdates.status = updates.status;
      if (updates.currentQIndex !== undefined) sbUpdates.current_q_index = updates.currentQIndex;
      if (updates.questionStatus !== undefined) sbUpdates.question_status = updates.questionStatus;
      if (updates.gameMode !== undefined) sbUpdates.game_mode = updates.gameMode;

      supabase
        .from('buiz_rooms')
        .update(sbUpdates)
        .eq('pin', pin)
        .then(({ error }) => {
          if (error) console.warn("Supabase room update warning:", error);
        });
    }

    try {
      await updateDoc(doc(db, "buiz_rooms", pin), updates);
    } catch (err) {
      console.warn("Firestore room update warning:", err);
    }
  };

  // 1. Host Timer Logic (Max 20s per question in Host-Paced mode)
  useEffect(() => {
    if (gameMode === 'ownPace') return;
    if (status === 'playing' && questionStatus === 'answering') {
      setTimeLeft(20);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time's up! Force reveal
            setQuestionStatus('revealed');
            syncRoomUpdate({ questionStatus: 'revealed' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, questionStatus, pin, gameMode]);

  // 2. Dynamic Skip (If all players answered early in Host-Paced mode)
  useEffect(() => {
    if (gameMode === 'ownPace') return;
    if (status === 'playing' && questionStatus === 'answering' && players.length > 0 && roomQuestions.length > 0) {
      const targetProgress = (currentQIndex + 1) / roomQuestions.length;
      const answeredCount = players.filter(p => (p.progress || 0) >= targetProgress - 0.001).length;
      
      if (answeredCount === players.length) {
        // Everyone has answered! Skip the timer and reveal
        setQuestionStatus('revealed');
        syncRoomUpdate({ questionStatus: 'revealed' });
      }
    }
  }, [players, status, questionStatus, currentQIndex, roomQuestions.length, pin, gameMode]);

  // 3. Auto-Advance to Next Question (Only in Host-Paced mode)
  useEffect(() => {
    if (gameMode === 'ownPace') return;
    if (status === 'playing' && questionStatus === 'revealed') {
      const timer = setTimeout(() => {
        if (currentQIndex + 1 < roomQuestions.length) {
          setCurrentQIndex(prev => prev + 1);
          setQuestionStatus('answering');
          syncRoomUpdate({
            currentQIndex: currentQIndex + 1,
            questionStatus: 'answering'
          });
        } else {
          endGame();
        }
      }, 7000); // 7 seconds so host/students can see results or host can click Next Question
      return () => clearTimeout(timer);
    }
  }, [questionStatus, status, currentQIndex, roomQuestions.length, pin, gameMode]);

  useEffect(() => {
    if (status === 'setup') {
      const fetchQuizzes = async () => {
        let quizzes: any[] = [];
        let history: any[] = [];

        // 1. Fetch from Supabase (if configured)
        if (isSupabaseConfigured) {
          try {
            const { data: sbQuizzes } = await supabase
              .from('buiz_saved_quizzes')
              .select('*')
              .order('created_at', { ascending: false });

            if (sbQuizzes) {
              quizzes = sbQuizzes.map((q: any) => ({
                id: q.id,
                name: q.name,
                questions: q.questions || [],
                totalPossiblePoints: q.total_possible_points || 0,
                createdAt: q.created_at
              }));
            }

            const { data: sbHistory } = await supabase
              .from('buiz_history')
              .select('*')
              .order('date', { ascending: false });

            if (sbHistory) {
              history = sbHistory.map((h: any) => ({
                id: h.id,
                quizName: h.quiz_name,
                pin: h.pin,
                date: h.date,
                gameMode: h.game_mode,
                questionsCount: h.questions_count,
                totalPossiblePoints: h.total_possible_points,
                totalPlayers: h.total_players,
                players: h.players || [],
                winners: h.winners || [],
                questions: h.questions || []
              }));
            }
          } catch (sbErr) {
            console.warn("Supabase fetch warning, falling back:", sbErr);
          }
        }

        // 2. Merge with Firestore so ZERO data is ever lost
        try {
          const snap = await getDocs(collection(db, 'buiz_saved_quizzes'));
          snap.forEach(doc => {
            const data = doc.data();
            if (!quizzes.some(q => q.id === doc.id || q.name === data.name)) {
              quizzes.push({ id: doc.id, ...data });
            }
          });

          const histSnap = await getDocs(collection(db, 'buiz_history'));
          histSnap.forEach(doc => {
            const data = doc.data();
            if (!history.some(h => h.id === doc.id || (h.pin && h.pin === data.pin))) {
              history.push({ id: doc.id, ...data });
            }
          });
          history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (fsErr) {
          console.warn("Firestore fetch note:", fsErr);
        }

        setSavedQuizzes(quizzes);
        setQuizHistory(history);
      };
      fetchQuizzes();
    }
  }, [status]);

  const getQuestionPoints = (q: any) => {
    if (questionPointsMap[q.id] !== undefined) return questionPointsMap[q.id];
    if (q.points !== undefined) return q.points;
    if (defaultPointsOption === 'byDifficulty') {
      return q.difficulty === 'Easy' ? 500 : q.difficulty === 'Hard' ? 1500 : 1000;
    }
    return 1000;
  };

  const generateRoom = async () => {
    if (selectedQuestions.size === 0 && customQuestions.length === 0) {
      toast.error("Select or create at least one question!");
      return;
    }

    // Generate a random 6 digit pin
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const selectedQs = QUESTIONS.filter(q => selectedQuestions.has(q.id)).map(q => ({
        ...q,
        points: getQuestionPoints(q)
      }));
      const finalCustomQs = customQuestions.map(q => ({
        ...q,
        points: q.points || getQuestionPoints(q) || 1000
      }));
      const finalPayload = [...selectedQs, ...finalCustomQs];
      const totalPossiblePoints = finalPayload.reduce((sum, q) => sum + (q.points || 1000), 0);

      // 1. Supabase Room Creation
      if (isSupabaseConfigured) {
        try {
          await supabase.from('buiz_rooms').upsert({
            pin: newPin,
            status: 'waiting',
            host_id: 'admin',
            quiz_name: quizName || 'Buiz Arena Quiz',
            questions: finalPayload,
            total_possible_points: totalPossiblePoints,
            current_q_index: 0,
            question_status: 'answering',
            game_mode: gameMode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (sbErr) {
          console.warn("Supabase room create warning:", sbErr);
        }
      }

      // 2. Firestore mirror for full backward compatibility
      try {
        await setDoc(doc(db, "buiz_rooms", newPin), {
          pin: newPin,
          status: 'waiting',
          hostId: 'admin',
          quizName: quizName || 'Buiz Arena Quiz',
          questions: finalPayload,
          totalPossiblePoints: totalPossiblePoints,
          currentQIndex: 0,
          questionStatus: 'answering',
          gameMode: gameMode,
          createdAt: new Date()
        });
      } catch (fsErr) {
        console.warn("Firestore room create warning:", fsErr);
      }

      setRoomQuestions(finalPayload);
      setPin(newPin);
      setStatus('waiting');
    } catch (err) {
      console.error("Failed to create room", err);
      toast.error("Failed to create room.");
    }
  };

  const saveQuiz = async () => {
    if (!quizName.trim()) {
      toast.error("Please enter a name for this quiz session!");
      return;
    }
    if (selectedQuestions.size === 0 && customQuestions.length === 0) {
      toast.error("Select or create at least one question!");
      return;
    }

    try {
      const selectedQs = QUESTIONS.filter(q => selectedQuestions.has(q.id)).map(q => ({
        ...q,
        points: getQuestionPoints(q)
      }));
      const finalCustomQs = customQuestions.map(q => ({
        ...q,
        points: q.points || getQuestionPoints(q) || 1000
      }));
      const finalPayload = [...selectedQs, ...finalCustomQs];
      const totalPossiblePoints = finalPayload.reduce((sum, q) => sum + (q.points || 1000), 0);
      const newQuizId = `quiz_${Date.now()}`;
      const createdAt = new Date().toISOString();

      // 1. Supabase
      if (isSupabaseConfigured) {
        try {
          await supabase.from('buiz_saved_quizzes').insert({
            id: newQuizId,
            name: quizName,
            questions: finalPayload,
            total_possible_points: totalPossiblePoints,
            created_at: createdAt
          });
        } catch (sbErr) {
          console.warn("Supabase save quiz warning:", sbErr);
        }
      }

      // 2. Firestore mirror
      try {
        await setDoc(doc(db, "buiz_saved_quizzes", newQuizId), {
          name: quizName,
          questions: finalPayload,
          totalPossiblePoints: totalPossiblePoints,
          createdAt: createdAt
        });
      } catch (fsErr) {
        console.warn("Firestore save quiz warning:", fsErr);
      }

      toast.success("Quiz saved successfully!");
      setStatus('setup');
      setQuizName('');
      setSelectedQuestions(new Set());
      setCustomQuestions([]);
      setQuestionPointsMap({});
    } catch (err) {
      console.error("Failed to save quiz", err);
      toast.error("Failed to save quiz.");
    }
  };

  const deleteSavedQuiz = async (quizId: string) => {
    try {
      if (isSupabaseConfigured) {
        await supabase.from('buiz_saved_quizzes').delete().eq('id', quizId);
      }
      await deleteDoc(doc(db, "buiz_saved_quizzes", quizId)).catch(() => {});
      setSavedQuizzes(savedQuizzes.filter(q => q.id !== quizId));
      toast.success("Saved quiz removed.");
    } catch (err) {
      console.error("Failed to delete quiz", err);
    }
  };

  const deleteQuizHistory = async (historyId: string) => {
    try {
      if (isSupabaseConfigured) {
        await supabase.from('buiz_history').delete().eq('id', historyId);
      }
      await deleteDoc(doc(db, "buiz_history", historyId)).catch(() => {});
      setQuizHistory(quizHistory.filter(h => h.id !== historyId));
      toast.success("Session history removed.");
    } catch (err) {
      console.error("Failed to delete history", err);
    }
  };

  const handleExportHistory = async (hist: any, format: 'csv' | 'pdf') => {
    try {
      let finalPlayers = hist.players && hist.players.length > 0 ? [...hist.players] : [];
      let finalQuestions = hist.questions || [];
      let questionsCount = hist.questionsCount || finalQuestions.length || 0;
      let totalPossiblePoints = hist.totalPossiblePoints || 0;

      // If historical record has <= 3 players or missing questions, attempt recovery from room in Supabase or Firestore
      if (hist.pin && (finalPlayers.length <= 3 || finalQuestions.length === 0)) {
        try {
          if (isSupabaseConfigured) {
            const { data: sbRoom } = await supabase.from('buiz_rooms').select('*').eq('pin', hist.pin).maybeSingle();
            if (sbRoom) {
              if ((!finalQuestions || finalQuestions.length === 0) && sbRoom.questions) {
                finalQuestions = sbRoom.questions;
                questionsCount = sbRoom.questions.length;
              }
              if (!totalPossiblePoints && sbRoom.total_possible_points) {
                totalPossiblePoints = sbRoom.total_possible_points;
              }
            }
            const { data: sbPlayers } = await supabase.from('buiz_players').select('*').eq('room_pin', hist.pin).order('score', { ascending: false });
            if (sbPlayers && sbPlayers.length > finalPlayers.length) {
              finalPlayers = sbPlayers.map((p: any, idx: number) => ({
                rank: idx + 1,
                name: p.name,
                score: p.score,
                streak: p.streak || 0,
                progress: p.progress || 0,
                answers: p.answers || {}
              }));
            }
          }

          if (finalPlayers.length <= 3 || finalQuestions.length === 0) {
            const roomDocSnap = await getDoc(doc(db, "buiz_rooms", hist.pin));
            if (roomDocSnap.exists()) {
              const roomData = roomDocSnap.data();
              if ((!finalQuestions || finalQuestions.length === 0) && roomData.questions) {
                finalQuestions = roomData.questions;
                questionsCount = roomData.questions.length;
              }
              if (!totalPossiblePoints && roomData.totalPossiblePoints) {
                totalPossiblePoints = roomData.totalPossiblePoints;
              }
            }

            const playersSnap = await getDocs(collection(db, "buiz_rooms", hist.pin, "players"));
            if (!playersSnap.empty && playersSnap.size > finalPlayers.length) {
              const fetched = playersSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
              fetched.sort((a, b) => (b.score || 0) - (a.score || 0));
              finalPlayers = fetched.map((p, idx) => ({
                rank: idx + 1,
                name: p.name,
                score: p.score,
                streak: p.streak || 0,
                progress: p.progress || 0,
                answers: p.answers || {}
              }));
            }
          }
        } catch (fetchErr) {
          console.warn("Could not retrieve original room players for history", fetchErr);
        }
      }

      // If still no players, fallback to winners
      if (finalPlayers.length === 0 && hist.winners && hist.winners.length > 0) {
        finalPlayers = hist.winners.map((w: any, idx: number) => ({
          rank: idx + 1,
          name: w.name,
          score: w.score,
          streak: 0,
          progress: 100,
          answers: {}
        }));
      }

      const reportPayload = {
        quizTitle: hist.quizName || 'Buiz Arena Quiz',
        pin: hist.pin || 'N/A',
        date: hist.date,
        gameMode: hist.gameMode,
        totalQuestions: questionsCount,
        totalPossiblePoints: totalPossiblePoints,
        players: finalPlayers,
        questions: finalQuestions
      };

      if (format === 'csv') {
        downloadLeaderboardCSV(reportPayload);
        toast.success(`Exported ${finalPlayers.length} participants to CSV!`);
      } else {
        downloadLeaderboardPDF(reportPayload);
        toast.success(`Exported ${finalPlayers.length} participants to PDF!`);
      }
    } catch (err) {
      console.error("Failed to export history", err);
      toast.error(`Failed to export ${format.toUpperCase()}`);
    }
  };

  const launchSavedQuiz = async (quiz: any) => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const totalPossiblePoints = (quiz.questions || []).reduce((sum: number, q: any) => sum + (q.points || 1000), 0);
      
      // 1. Supabase Room Creation
      if (isSupabaseConfigured) {
        try {
          await supabase.from('buiz_rooms').upsert({
            pin: newPin,
            status: 'waiting',
            host_id: 'admin',
            quiz_name: quiz.name || 'Saved Quiz Session',
            questions: quiz.questions,
            total_possible_points: totalPossiblePoints,
            current_q_index: 0,
            question_status: 'answering',
            game_mode: quiz.gameMode || gameMode || 'hostPaced',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (sbErr) {
          console.warn("Supabase launch saved quiz warning:", sbErr);
        }
      }

      // 2. Firestore mirror
      try {
        await setDoc(doc(db, "buiz_rooms", newPin), {
          pin: newPin,
          status: 'waiting',
          hostId: 'admin',
          quizName: quiz.name || 'Saved Quiz Session',
          questions: quiz.questions,
          totalPossiblePoints: totalPossiblePoints,
          currentQIndex: 0,
          questionStatus: 'answering',
          gameMode: quiz.gameMode || gameMode || 'hostPaced',
          createdAt: new Date()
        });
      } catch (fsErr) {
        console.warn("Firestore launch saved quiz warning:", fsErr);
      }

      setRoomQuestions(quiz.questions);
      setPin(newPin);
      setStatus('waiting');
    } catch (err) {
      console.error("Failed to create room from saved quiz", err);
      toast.error("Failed to launch quiz session.");
    }
  };

  const handleQuickPick = () => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    const selectedIds = new Set(shuffled.slice(0, 10).map(q => q.id));
    setSelectedQuestions(selectedIds);
  };

  const toggleQuestion = (id: number | string) => {
    const newSet = new Set(selectedQuestions);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestions(newSet);
  };

  const setPointForQuestion = (id: number | string, points: number) => {
    setQuestionPointsMap(prev => ({ ...prev, [id]: points }));
  };

  const applyPresetPoints = (preset: 'standard' | 'byDifficulty' | 'highStakes') => {
    setDefaultPointsOption(preset);
    const newMap: { [id: string | number]: number } = {};
    if (preset === 'standard') {
      selectedQuestions.forEach(id => {
        newMap[id] = 1000;
      });
      toast.success("Set all selected questions to 1,000 pts (Standard)");
    } else if (preset === 'byDifficulty') {
      QUESTIONS.forEach(q => {
        if (selectedQuestions.has(q.id)) {
          newMap[q.id] = q.difficulty === 'Easy' ? 500 : q.difficulty === 'Hard' ? 1500 : 1000;
        }
      });
      toast.success("Applied difficulty points: Easy=500, Medium=1,000, Hard=1,500");
    } else if (preset === 'highStakes') {
      selectedQuestions.forEach(id => {
        newMap[id] = 2000;
      });
      toast.success("Set all selected questions to 2,000 pts (High Stakes)");
    }
    setQuestionPointsMap(newMap);
  };

  const addCustomQuestion = () => {
    if (!cqText.trim() || cqOptions.some(opt => !opt.trim())) {
      toast.error("Please fill out the question and all 4 options.");
      return;
    }
    const newQ: CustomQuestion = {
      id: `custom_${Date.now()}`,
      question: cqText,
      options: [...cqOptions],
      answer: cqAnswer,
      difficulty: 'Medium',
      topic: 'Custom',
      points: Number(cqPoints) || 1000
    };
    setCustomQuestions([...customQuestions, newQ]);
    setCqText('');
    setCqOptions(['', '', '', '']);
    setCqAnswer(0);
    setCqPoints(1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const validEmails = ['admin@buildicy.com', 'buildicy@gmail.com', 'admin@buiz.com', 'host@buiz.com', 'admin@buildicy.in'];
    const validPasswords = ['PrAjWaL@123MaYuR@123', 'admin123', 'buildicy@123', 'admin'];

    // 1. Host Admin credentials bypass (Always works instantly)
    if (validEmails.includes(cleanEmail) && validPasswords.includes(cleanPass)) {
      sessionStorage.setItem('buiz_host_auth', 'true');
      setStatus('setup');
      setLoginError('');
      toast.success('Authenticated as Host Admin!');
      return;
    }

    // 2. Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error: sbAuthErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass
        });
        if (data?.user && !sbAuthErr) {
          sessionStorage.setItem('buiz_host_auth', 'true');
          setStatus('setup');
          setLoginError('');
          toast.success('Authenticated via Supabase!');
          return;
        }
      } catch (err) {
        console.warn('Supabase sign-in note:', err);
      }
    }

    // 3. Fallback: Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      sessionStorage.setItem('buiz_host_auth', 'true');
      setStatus('setup');
      setLoginError('');
      toast.success('Authenticated as Host Admin!');
    } catch (err) {
      setLoginError('Invalid secure credentials. Please check your host email and password.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/buiz/host'
          }
        });
        if (!error) return;
      }
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      sessionStorage.setItem('buiz_host_auth', 'true');
      setStatus('setup');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setLoginError('Google sign-in failed.');
      }
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('buiz_host_auth');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
    setStatus('login');
    toast.success('Signed out of Host Panel');
  };

  const startGame = async () => {
    if (!pin) return;
    setCurrentQIndex(0);
    setQuestionStatus('answering');
    if (gameMode === 'ownPace') {
      await syncRoomUpdate({
        status: 'playing',
        startedAt: new Date()
      });
    } else {
      await syncRoomUpdate({
        status: 'playing',
        currentQIndex: 0,
        questionStatus: 'answering',
        startedAt: new Date()
      });
    }
    setStatus('playing');
  };

  // Manual Host-Paced Controls: Reveal immediately or advance immediately without waiting for timers
  const handleManualReveal = async () => {
    if (!pin || gameMode === 'ownPace') return;
    setQuestionStatus('revealed');
    try {
      await syncRoomUpdate({ questionStatus: 'revealed' });
    } catch (err) {
      console.error("Failed to manually reveal", err);
    }
  };

  const handleManualNextQuestion = async () => {
    if (!pin || gameMode === 'ownPace') return;
    if (currentQIndex + 1 < roomQuestions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setQuestionStatus('answering');
      try {
        await syncRoomUpdate({
          currentQIndex: nextIdx,
          questionStatus: 'answering'
        });
      } catch (err) {
        console.error("Failed to advance question", err);
      }
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    if (!pin) return;
    await syncRoomUpdate({
      status: 'finished'
    });
    setStatus('finished');
    setFinishedTab('podium');

    // Start dramatic podium sequence
    setTimeout(() => setPodiumPhase(1), 1000);
    setTimeout(() => setPodiumPhase(2), 4000);
    setTimeout(() => setPodiumPhase(3), 8000);
    
    // Save to history with all attended player results, question scores, and rankings
    try {
      let allCurrentPlayers = players;
      
      // 1. Check Supabase for fresh players
      if (isSupabaseConfigured) {
        try {
          const { data: freshSb } = await supabase
            .from('buiz_players')
            .select('*')
            .eq('room_pin', pin)
            .order('score', { ascending: false });
          if (freshSb && freshSb.length > 0) {
            allCurrentPlayers = freshSb.map((p: any) => ({
              id: p.id,
              name: p.name,
              score: p.score || 0,
              streak: p.streak || 0,
              progress: Number(p.progress) || 0,
              avatar: p.avatar,
              currentQIndex: p.current_q_index,
              answers: p.answers || {}
            }));
            setPlayers(allCurrentPlayers);
          }
        } catch (sbErr) {
          console.warn("Supabase fresh player query warning:", sbErr);
        }
      }

      // 2. Fallback to Firestore if empty
      if (allCurrentPlayers.length === 0) {
        try {
          const playersSnap = await getDocs(collection(db, "buiz_rooms", pin, "players"));
          if (!playersSnap.empty) {
            const fetchedPlayers = playersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Player));
            fetchedPlayers.sort((a, b) => (b.score || 0) - (a.score || 0));
            allCurrentPlayers = fetchedPlayers;
            setPlayers(fetchedPlayers);
          }
        } catch (err) {
          console.error("Failed to query fresh players for history", err);
        }
      }

      const top3 = allCurrentPlayers.slice(0, 3).map(p => ({ name: p.name, score: p.score }));
      const totalPossiblePoints = roomQuestions.reduce((sum, q) => sum + (q.points || 1000), 0);
      const newHistId = `hist_${Date.now()}`;
      const histDate = new Date().toISOString();

      const histPayload = {
        quiz_name: quizName || 'Quick Session',
        date: histDate,
        winners: top3,
        total_players: allCurrentPlayers.length,
        pin: pin,
        game_mode: gameMode,
        questions_count: roomQuestions.length,
        total_possible_points: totalPossiblePoints,
        questions: roomQuestions.map(q => ({
          id: q.id,
          question: q.question,
          difficulty: q.difficulty,
          topic: q.topic,
          points: q.points || 1000
        })),
        players: allCurrentPlayers.map((p, idx) => ({
          rank: idx + 1,
          name: p.name,
          score: p.score,
          streak: p.streak || 0,
          progress: p.progress || 0,
          answers: p.answers || {}
        }))
      };

      // 1. Supabase History
      if (isSupabaseConfigured) {
        try {
          await supabase.from('buiz_history').insert({
            id: newHistId,
            ...histPayload,
            created_at: histDate
          });
        } catch (sbErr) {
          console.warn("Supabase save history warning:", sbErr);
        }
      }

      // 2. Firestore mirror
      try {
        await setDoc(doc(db, "buiz_history", newHistId), {
          quizName: histPayload.quiz_name,
          date: histDate,
          winners: histPayload.winners,
          totalPlayers: histPayload.total_players,
          pin: pin,
          gameMode: gameMode,
          questionsCount: histPayload.questions_count,
          totalPossiblePoints: totalPossiblePoints,
          questions: histPayload.questions,
          players: histPayload.players
        });
      } catch (fsErr) {
        console.warn("Firestore save history warning:", fsErr);
      }
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  const copyPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'login') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.15)]"
        >
          <button
            onClick={() => window.location.href = '/'}
            className="absolute top-4 left-4 text-zinc-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
            <Lock className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 text-center">Host Login</h1>
          <p className="text-zinc-400 text-center mb-8 text-sm">Secure access to the Buiz Arena Host Panel</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                required
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-5 py-4 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {loginError && <p className="text-red-400 text-sm font-bold text-center">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-4 mt-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (status === 'setup') {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.1)]"
        >
          <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 shrink-0">
                <Target className="text-purple-400" size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-3xl font-black text-white tracking-tight">Host Buiz Arena</h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    DB: Supabase (Postgres)
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">Create a live multiplayer session or launch a saved quiz.</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out of Host Panel"
              className="px-3.5 py-2 bg-white/5 hover:bg-red-500/15 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>

          <button
            onClick={() => setStatus('configure')}
            className="w-full py-4 mb-8 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center justify-center gap-3"
          >
            <Plus size={24} /> Create New Quiz Session
          </button>

          <div className="flex gap-4 mb-4 border-b border-white/10 pb-2">
            <button 
              onClick={() => setSetupTab('saved')} 
              className={`text-lg font-bold pb-2 transition-colors border-b-2 ${setupTab === 'saved' ? 'text-white border-purple-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              Saved Quizzes
            </button>
            <button 
              onClick={() => setSetupTab('history')} 
              className={`text-lg font-bold pb-2 transition-colors border-b-2 ${setupTab === 'history' ? 'text-white border-purple-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
            >
              Quiz History
            </button>
          </div>

          <div>
            {setupTab === 'saved' ? (
              savedQuizzes.length === 0 ? (
                <p className="text-zinc-500 text-center py-8 border border-white/5 rounded-xl bg-white/[0.02]">No saved quizzes yet. Create one above!</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {savedQuizzes.map(quiz => (
                    <div key={quiz.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
                      <div>
                        <h3 className="font-bold text-white text-lg">{quiz.name}</h3>
                        <p className="text-xs text-zinc-400 font-mono mt-1">{quiz.questions?.length || 0} Questions • {new Date(quiz.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => launchSavedQuiz(quiz)}
                          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-bold transition-colors text-sm flex items-center gap-2"
                        >
                          <Play fill="currentColor" size={14} /> Launch
                        </button>
                        <button
                          onClick={() => deleteSavedQuiz(quiz.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              quizHistory.length === 0 ? (
                <p className="text-zinc-500 text-center py-8 border border-white/5 rounded-xl bg-white/[0.02]">No quiz history found.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {quizHistory.map(hist => (
                    <div key={hist.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-white text-base">{hist.quizName}</h3>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            {new Date(hist.date).toLocaleString()} • {hist.totalPlayers || (hist.players ? hist.players.length : 0)} Players • {hist.totalPossiblePoints ? `${hist.totalPossiblePoints.toLocaleString()} Max Pts` : `${Math.max(10, hist.questionsCount || (hist.questions ? hist.questions.length : 10)) * 1000} Max Pts`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleExportHistory(hist, 'csv')}
                            className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                            title="Download CSV Report"
                          >
                            <FileSpreadsheet size={13} /> CSV
                          </button>
                          <button
                            onClick={() => handleExportHistory(hist, 'pdf')}
                            className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                            title="Download PDF Report"
                          >
                            <FileText size={13} /> PDF
                          </button>
                          <button
                            onClick={() => deleteQuizHistory(hist.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            title="Delete History"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {(() => {
                        const playerList = (hist.players && hist.players.length > 0)
                          ? hist.players
                          : (hist.winners || []);
                        return (
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            {playerList.map((p: any, idx: number) => (
                              <div
                                key={idx}
                                className={`border px-2.5 py-1 rounded-lg flex items-center gap-2 text-xs transition-all ${
                                  idx === 0
                                    ? 'bg-yellow-500/10 border-yellow-500/30'
                                    : idx === 1
                                    ? 'bg-zinc-400/10 border-zinc-400/20'
                                    : idx === 2
                                    ? 'bg-orange-500/10 border-orange-500/20'
                                    : 'bg-black/30 border-white/10'
                                }`}
                              >
                                <span
                                  className={`font-black ${
                                    idx === 0
                                      ? 'text-yellow-400'
                                      : idx === 1
                                      ? 'text-zinc-300'
                                      : idx === 2
                                      ? 'text-orange-400'
                                      : 'text-zinc-500'
                                  }`}
                                >
                                  #{idx + 1}
                                </span>
                                <span className="text-white font-medium">{p.name}</span>
                                <span className="text-purple-400 font-mono font-bold">
                                  {(p.score || 0).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'configure') {
    const totalQuizPoints = (() => {
      const selectedQs = QUESTIONS.filter(q => selectedQuestions.has(q.id));
      const qPts = selectedQs.reduce((sum, q) => sum + getQuestionPoints(q), 0);
      const cPts = customQuestions.reduce((sum, q) => sum + (q.points || 1000), 0);
      return qPts + cPts;
    })();

    return (
      <div className="min-h-screen bg-[#050507] flex flex-col p-4 md:p-6">
        <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col h-full bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-purple-500/20">
            <div className="flex-1 max-w-2xl flex items-start gap-3">
              <button
                type="button"
                onClick={() => setStatus('setup')}
                className="mt-6 p-2.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white rounded-xl border border-purple-500/30 transition-all shrink-0 active:scale-95"
                title="Back to Host Menu"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="quiz-session-title" className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-300">
                    <Edit3 size={14} className="text-purple-400" />
                    <span>Quiz Session Name</span>
                    <span className="text-purple-400/80 text-[10px] bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                      Enter Name
                    </span>
                  </label>
                  <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                    Name your live quiz arena
                  </span>
                </div>

                <div className="relative flex items-center bg-[#141224] border-2 border-purple-500/50 hover:border-purple-400 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/25 rounded-2xl px-4 py-2.5 transition-all shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  <input
                    id="quiz-session-title"
                    type="text"
                    placeholder="Type Quiz Name here (e.g. AI & Tech Masterclass 2026)..."
                    value={quizName}
                    onChange={e => setQuizName(e.target.value)}
                    className="w-full bg-transparent border-none text-base md:text-lg font-bold text-white placeholder-zinc-500 focus:outline-none"
                  />
                  {quizName ? (
                    <button
                      type="button"
                      onClick={() => setQuizName('')}
                      className="text-zinc-400 hover:text-white p-1 text-xs transition-colors shrink-0 ml-2"
                      title="Clear title"
                    >
                      ✕
                    </button>
                  ) : (
                    <span className="text-xs text-purple-400/70 font-semibold shrink-0 ml-2 pointer-events-none hidden sm:inline">
                      ✍️ Type name here
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs">
                  <span className="px-2.5 py-1 bg-purple-900/30 border border-purple-500/30 text-purple-300 font-bold rounded-lg flex items-center gap-1.5">
                    <Sparkles size={12} className="text-purple-400" />
                    {selectedQuestions.size + customQuestions.length} Questions Selected
                  </span>
                  <span className="px-2.5 py-1 bg-yellow-950/30 border border-yellow-500/30 text-yellow-300 font-bold font-mono rounded-lg flex items-center gap-1.5">
                    <Award size={12} className="text-yellow-400" />
                    {totalQuizPoints.toLocaleString()} Total Max Points
                  </span>
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-zinc-400 rounded-lg">
                    {selectedQuestions.size} Bank &bull; {customQuestions.length} Custom
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons styled in Purple */}
            <div className="flex flex-wrap items-center gap-2.5 lg:self-center">
              <div className="flex bg-[#161226] rounded-xl p-1 border border-purple-500/30 shadow-inner">
                <button
                  type="button"
                  onClick={() => setGameMode('hostPaced')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                    gameMode === 'hostPaced'
                      ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  <Clock size={14} /> Host Paced
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode('ownPace')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                    gameMode === 'ownPace'
                      ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'text-purple-300/70 hover:text-white hover:bg-purple-900/30'
                  }`}
                >
                  <Zap size={14} /> Own Pace
                </button>
              </div>

              <button
                type="button"
                onClick={handleQuickPick}
                className="px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 hover:text-white rounded-xl font-bold transition-all text-xs md:text-sm border border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles size={14} className="text-purple-400" />
                Quick 10
              </button>

              <button
                type="button"
                onClick={saveQuiz}
                className="px-4 py-2.5 bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 hover:text-white rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs md:text-sm border border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] active:scale-95"
              >
                <Save size={15} className="text-purple-300" /> Save
              </button>

              <button
                type="button"
                onClick={generateRoom}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black transition-all shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] flex items-center gap-2 text-xs md:text-sm active:scale-95 tracking-wide"
              >
                Launch Now <Target size={15} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 h-[65vh]">
            {/* Scoring System Controls */}
            <div className="p-5 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Award className="text-yellow-400" size={20} />
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Question Scoring System
                      <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-mono font-bold rounded-full">
                        Total: {totalQuizPoints.toLocaleString()} pts
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400">Set custom score values for each question below. Correct answers earn base points plus speed and streak bonuses.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-zinc-400 font-bold">Quick Presets:</span>
                  <button
                    onClick={() => applyPresetPoints('standard')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${defaultPointsOption === 'standard' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400 scale-105' : 'bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/60 border border-purple-500/30'}`}
                  >
                    1,000 pts All
                  </button>
                  <button
                    onClick={() => applyPresetPoints('byDifficulty')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${defaultPointsOption === 'byDifficulty' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400 scale-105' : 'bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/60 border border-purple-500/30'}`}
                  >
                    By Difficulty (500/1k/1.5k)
                  </button>
                  <button
                    onClick={() => applyPresetPoints('highStakes')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${defaultPointsOption === 'highStakes' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400 scale-105' : 'bg-purple-950/40 text-purple-300 hover:text-white hover:bg-purple-900/60 border border-purple-500/30'}`}
                  >
                    2,000 pts High Stakes
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Question Builder */}
            <div className="p-6 bg-purple-900/10 border border-purple-500/30 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus size={18} /> Create Custom Question</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter your question..."
                  value={cqText}
                  onChange={e => setCqText(e.target.value)}
                  className="w-full bg-[#1A1A24]/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 text-sm md:text-base"
                />
                
                {/* Custom Question Points */}
                <div className="flex flex-wrap items-center gap-3 bg-black/40 p-3.5 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 uppercase tracking-wider">
                    <Award size={14} /> Question Score:
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[500, 1000, 1500, 2000, 2500].map(pt => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setCqPoints(pt)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${cqPoints === pt ? 'bg-yellow-500 text-black shadow-md scale-105 font-black' : 'bg-purple-950/40 text-purple-200 hover:text-white hover:bg-purple-900/50 border border-purple-500/30'}`}
                      >
                        {pt.toLocaleString()} pts {pt === 1000 ? '(Std)' : ''}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-xs text-zinc-400 font-medium">Custom:</span>
                    <input
                      type="number"
                      min={100}
                      max={10000}
                      step={100}
                      value={cqPoints}
                      onChange={e => setCqPoints(Number(e.target.value) || 1000)}
                      className="w-24 bg-[#1A1A24] border border-yellow-500/40 rounded-lg px-2 py-1 text-xs text-yellow-300 text-center font-mono font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cqOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={cqAnswer === idx}
                        onChange={() => setCqAnswer(idx)}
                        className="w-4 h-4 text-purple-600 bg-zinc-800 border-zinc-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={e => {
                          const newOpts = [...cqOptions];
                          newOpts[idx] = e.target.value;
                          setCqOptions(newOpts);
                        }}
                        className={`w-full bg-[#1A1A24]/50 border rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${cqAnswer === idx ? 'border-green-500/50' : 'border-white/10'}`}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addCustomQuestion}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all text-sm shadow-md flex items-center gap-2 active:scale-95"
                >
                  <Plus size={16} /> Add to Arena (💎 {cqPoints.toLocaleString()} pts)
                </button>
              </div>

              {customQuestions.length > 0 && (
                <div className="mt-6 space-y-2 border-t border-purple-500/20 pt-4">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Added Custom Questions</p>
                  {customQuestions.map(q => (
                    <div key={q.id} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-5 h-5 rounded bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={14} />
                        </div>
                        <p className="text-white text-sm font-medium truncate">{q.question}</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-full text-xs font-mono font-bold shrink-0">
                        💎 {(q.points || 1000).toLocaleString()} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Question Bank Selection */}
            <div className="border-t border-white/5 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Select from Question Bank
                  <span className="text-xs text-zinc-400 font-normal">({QUESTIONS.length} Available)</span>
                </h2>
                <span className="text-xs text-zinc-400 hidden sm:inline">Click question to toggle &bull; adjust score per question</span>
              </div>

              {QUESTIONS.length === 0 ? (
                <p className="text-white/40 text-sm italic">Loading questions or The Crucible is empty...</p>
              ) : (
                <div className="space-y-2.5">
                  {QUESTIONS.map((q) => {
                    const isSelected = selectedQuestions.has(q.id);
                    const points = getQuestionPoints(q);

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isSelected ? 'bg-purple-600/20 border-purple-500/50 shadow-sm' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        <div
                          onClick={() => toggleQuestion(q.id)}
                          className="flex items-start gap-3 cursor-pointer flex-1"
                        >
                          <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-zinc-500 text-transparent'}`}>
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : q.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                {q.difficulty}
                              </span>
                              <span className="text-xs text-zinc-500 font-mono">{q.topic}</span>
                              <span className="px-2.5 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-mono font-bold text-xs rounded-full flex items-center gap-1 shadow-sm">
                                💎 {points.toLocaleString()} pts
                              </span>
                            </div>
                            <p className="text-white font-medium text-sm sm:text-base">{q.question}</p>
                          </div>
                        </div>

                        {/* Points selector for this question */}
                        <div className="flex items-center gap-2 pl-9 sm:pl-0 shrink-0 bg-black/40 border border-yellow-500/30 px-3 py-1.5 rounded-xl shadow-sm">
                          <span className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                            <Award size={13} /> Score:
                          </span>
                          <select
                            value={points}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              setPointForQuestion(q.id, Number(e.target.value));
                              if (!isSelected) toggleQuestion(q.id);
                            }}
                            className="bg-[#1A1A24] border border-white/20 hover:border-yellow-400 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-yellow-300 focus:outline-none focus:border-yellow-400 cursor-pointer transition-colors"
                          >
                            <option value={500}>500 pts (Easy)</option>
                            <option value={1000}>1,000 pts (Standard)</option>
                            <option value={1500}>1,500 pts (Bonus)</option>
                            <option value={2000}>2,000 pts (Double)</option>
                            <option value={2500}>2,500 pts (High Stakes)</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Finished State - Dramatic Podium & Comprehensive Leaderboard Report Center
  if (status === 'finished') {
    const top3 = players.slice(0, 3);
    const totalPossiblePoints = roomQuestions.reduce((sum, q) => sum + (q.points || 1000), 0);
    const avgScore = players.length > 0 ? Math.round(players.reduce((sum, p) => sum + p.score, 0) / players.length) : 0;
    const avgAccuracy = players.length > 0
      ? Math.round(players.reduce((sum, p) => sum + calculatePlayerStats(p, roomQuestions, roomQuestions.length).accuracy, 0) / players.length)
      : 0;

    const filteredPlayers = players.filter(p =>
      p.name.toLowerCase().includes(leaderboardSearch.toLowerCase().trim())
    );
    const displayedPlayers = hostPageLimit === -1 ? filteredPlayers : filteredPlayers.slice(0, hostPageLimit);

    const handleDownloadCSV = async () => {
      setIsExporting('csv');
      try {
        let exportPlayers = players;
        if (pin) {
          if (isSupabaseConfigured) {
            try {
              const { data: sbFresh } = await supabase
                .from('buiz_players')
                .select('*')
                .eq('room_pin', pin)
                .order('score', { ascending: false });
              if (sbFresh && sbFresh.length > 0) {
                exportPlayers = sbFresh.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  score: p.score || 0,
                  streak: p.streak || 0,
                  progress: Number(p.progress) || 0,
                  avatar: p.avatar,
                  currentQIndex: p.current_q_index,
                  answers: p.answers || {}
                }));
                setPlayers(exportPlayers);
              }
            } catch (e) {
              console.warn("Supabase refresh for CSV warning:", e);
            }
          }
          if (exportPlayers.length === 0) {
            try {
              const playersSnap = await getDocs(collection(db, "buiz_rooms", pin, "players"));
              if (!playersSnap.empty) {
                const freshList = playersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Player));
                freshList.sort((a, b) => (b.score || 0) - (a.score || 0));
                exportPlayers = freshList;
                setPlayers(freshList);
              }
            } catch (e) {
              console.error("Could not refresh players for CSV export", e);
            }
          }
        }
        downloadLeaderboardCSV({
          quizTitle: quizName || 'Buiz Arena Quiz',
          pin: pin || 'N/A',
          date: new Date(),
          gameMode: gameMode,
          totalQuestions: roomQuestions.length,
          totalPossiblePoints: totalPossiblePoints,
          players: exportPlayers,
          questions: roomQuestions
        });
        toast.success(`Leaderboard CSV report (${exportPlayers.length} participants) downloaded!`);
      } catch (err) {
        console.error("CSV Export failed", err);
        toast.error("Failed to generate CSV.");
      } finally {
        setIsExporting(null);
      }
    };

    const handleDownloadPDF = async () => {
      setIsExporting('pdf');
      try {
        let exportPlayers = players;
        if (pin) {
          if (isSupabaseConfigured) {
            try {
              const { data: sbFresh } = await supabase
                .from('buiz_players')
                .select('*')
                .eq('room_pin', pin)
                .order('score', { ascending: false });
              if (sbFresh && sbFresh.length > 0) {
                exportPlayers = sbFresh.map((p: any) => ({
                  id: p.id,
                  name: p.name,
                  score: p.score || 0,
                  streak: p.streak || 0,
                  progress: Number(p.progress) || 0,
                  avatar: p.avatar,
                  currentQIndex: p.current_q_index,
                  answers: p.answers || {}
                }));
                setPlayers(exportPlayers);
              }
            } catch (e) {
              console.warn("Supabase refresh for PDF warning:", e);
            }
          }
          if (exportPlayers.length === 0) {
            try {
              const playersSnap = await getDocs(collection(db, "buiz_rooms", pin, "players"));
              if (!playersSnap.empty) {
                const freshList = playersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Player));
                freshList.sort((a, b) => (b.score || 0) - (a.score || 0));
                exportPlayers = freshList;
                setPlayers(freshList);
              }
            } catch (e) {
              console.error("Could not refresh players for PDF export", e);
            }
          }
        }
        downloadLeaderboardPDF({
          quizTitle: quizName || 'Buiz Arena Quiz',
          pin: pin || 'N/A',
          date: new Date(),
          gameMode: gameMode,
          totalQuestions: roomQuestions.length,
          totalPossiblePoints: totalPossiblePoints,
          players: exportPlayers,
          questions: roomQuestions
        });
        toast.success(`Leaderboard PDF report (${exportPlayers.length} participants) downloaded!`);
      } catch (err) {
        console.error("PDF Export failed", err);
        toast.error("Failed to generate PDF.");
      } finally {
        setIsExporting(null);
      }
    };

    return (
      <div className="min-h-screen bg-[#050507] flex flex-col p-4 md:p-8 relative overflow-hidden">
        {podiumPhase === 3 && finishedTab === 'podium' && (
          <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2018/01/29/13/03/confetti-3116032_1280.png')] opacity-30 animate-pulse mix-blend-screen pointer-events-none z-10" />
        )}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-yellow-500/10 rounded-full blur-[200px] pointer-events-none" />

        {/* Top Navigation & Action Controls Bar */}
        <div className="max-w-6xl mx-auto w-full relative z-30 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-2xl">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={() => setStatus('setup')}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              title="Return to Setup"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">{quizName || 'Buiz Arena Quiz'}</h1>
              <p className="text-xs text-zinc-400 font-mono">
                PIN: {pin} • {players.length} Students • {totalPossiblePoints.toLocaleString()} Total Max Pts
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 w-full md:w-auto justify-center">
            <button
              onClick={() => setFinishedTab('podium')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${finishedTab === 'podium' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              <Trophy size={16} /> Podium View
            </button>
            <button
              onClick={() => setFinishedTab('leaderboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${finishedTab === 'leaderboard' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              <BarChart3 size={16} /> Full Leaderboard & Reports
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-mono">{players.length}</span>
            </button>
          </div>

          {/* Report Export Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={handleDownloadCSV}
              disabled={isExporting !== null || players.length === 0}
              className="flex-1 md:flex-initial px-3.5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              title="Download Excel / CSV Report"
            >
              <FileSpreadsheet size={16} /> Export CSV
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting !== null || players.length === 0}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
              title="Download Branded PDF Report"
            >
              <FileText size={16} /> Download PDF
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl transition-all border border-white/10"
              title="Start New Game"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Tab 1: Dramatic Animated Podium */}
        {finishedTab === 'podium' && (
          <div className="flex-1 flex flex-col items-center justify-center relative z-20 py-8">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-12 md:mb-16 text-center uppercase tracking-[0.2em]">
              Final Results
            </h2>

            <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-8 h-80 md:h-96 relative z-30 w-full max-w-2xl px-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center flex-1 max-w-[160px]">
                <AnimatePresence>
                  {podiumPhase >= 2 && top3[1] && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-3">
                      <p className="text-base md:text-lg font-bold text-white truncate max-w-[140px]">{top3[1].name}</p>
                      <p className="text-xs md:text-sm text-zinc-400 font-mono font-bold">{top3[1].score.toLocaleString()} pts</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: podiumPhase >= 2 ? 150 : 0 }}
                  transition={{ duration: 1, type: "spring" }}
                  className="w-full bg-gradient-to-t from-zinc-800 to-zinc-500/50 rounded-t-xl flex items-start justify-center pt-3 border-t-2 border-zinc-400 shadow-[0_0_30px_rgba(161,161,170,0.2)]"
                >
                  {podiumPhase >= 2 && <span className="text-2xl md:text-3xl font-black text-zinc-300">2</span>}
                </motion.div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center flex-1 max-w-[180px] z-10">
                <AnimatePresence>
                  {podiumPhase >= 3 && top3[0] && (
                    <motion.div initial={{ opacity: 0, scale: 0.5, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", bounce: 0.6 }} className="text-center mb-3">
                      <Trophy className="text-yellow-400 mx-auto mb-1" size={32} />
                      <p className="text-lg md:text-2xl font-black text-yellow-400 truncate max-w-[160px]">{top3[0].name}</p>
                      <p className="text-sm md:text-base text-yellow-500/80 font-mono font-bold">{top3[0].score.toLocaleString()} pts</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: podiumPhase >= 3 ? 220 : 0 }}
                  transition={{ duration: 1, type: "spring", delay: 0.2 }}
                  className="w-full bg-gradient-to-t from-yellow-900/60 to-yellow-500/60 rounded-t-xl flex items-start justify-center pt-3 border-t-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.4)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                  {podiumPhase >= 3 && <span className="text-4xl md:text-5xl font-black text-yellow-300 relative z-10 drop-shadow-md">1</span>}
                </motion.div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center flex-1 max-w-[160px]">
                <AnimatePresence>
                  {podiumPhase >= 1 && top3[2] && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-3">
                      <p className="text-base md:text-lg font-bold text-white truncate max-w-[140px]">{top3[2].name}</p>
                      <p className="text-xs md:text-sm text-zinc-400 font-mono font-bold">{top3[2].score.toLocaleString()} pts</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: podiumPhase >= 1 ? 110 : 0 }}
                  transition={{ duration: 1, type: "spring" }}
                  className="w-full bg-gradient-to-t from-orange-900/50 to-orange-500/30 rounded-t-xl flex items-start justify-center pt-3 border-t-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
                >
                  {podiumPhase >= 1 && <span className="text-xl md:text-2xl font-black text-orange-400">3</span>}
                </motion.div>
              </div>
            </div>

            {podiumPhase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-4"
              >
                <button
                  onClick={() => setFinishedTab('leaderboard')}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-base md:text-lg transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center gap-2"
                >
                  <BarChart3 size={20} /> View Full Leaderboard & Reports
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab 2: Full Leaderboard & Analytics Center */}
        {finishedTab === 'leaderboard' && (
          <div className="max-w-6xl mx-auto w-full relative z-20 flex-1 flex flex-col space-y-6">
            {/* KPI Cards Grid (Mobile responsive: 2 columns on mobile, 4 columns on desktop) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Champion</p>
                <p className="text-lg md:text-xl font-black text-yellow-400 truncate">{top3[0]?.name || 'N/A'}</p>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{top3[0]?.score.toLocaleString() || 0} points</p>
              </div>
              <div className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Students</p>
                <p className="text-lg md:text-xl font-black text-purple-400">{players.length}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{roomQuestions.length} Questions</p>
              </div>
              <div className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Class Average</p>
                <p className="text-lg md:text-xl font-black text-white">{avgScore.toLocaleString()}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{totalPossiblePoints > 0 ? `${Math.round((avgScore / totalPossiblePoints) * 100)}% of Max` : ''}</p>
              </div>
              <div className="bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Top Score</p>
                <p className="text-lg md:text-xl font-black text-yellow-400">{(top3[0]?.score || 0).toLocaleString()}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Arena High Score</p>
              </div>
            </div>

            {/* Controls Bar: Search & Matrix Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search students by name..."
                  value={leaderboardSearch}
                  onChange={(e) => setLeaderboardSearch(e.target.value)}
                  className="w-full bg-[#1A1A24]/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowQuestionMatrix(!showQuestionMatrix)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${showQuestionMatrix ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 text-zinc-300 hover:text-white border-white/10'}`}
                >
                  <Grid3X3 size={15} /> {showQuestionMatrix ? 'Hide Question Breakdown' : 'Show Question Breakdown'}
                </button>
              </div>
            </div>

            {/* Page Size & High-Volume Roster Selector */}
            {filteredPlayers.length > 25 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs text-zinc-400">
                <span>Showing <strong>{displayedPlayers.length}</strong> of <strong>{filteredPlayers.length}</strong> students</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500 font-medium">Show:</span>
                  {[25, 50, 100, -1].map((size) => (
                    <button
                      key={size}
                      onClick={() => setHostPageLimit(size)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        hostPageLimit === size ? 'bg-purple-600 text-white shadow' : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {size === -1 ? `All (${filteredPlayers.length})` : size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile View: Cards for small screens */}
            <div className="block md:hidden space-y-3">
              {displayedPlayers.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">No participants found matching &ldquo;{leaderboardSearch}&rdquo;</div>
              ) : (
                displayedPlayers.map((p, idx) => {
                  const rank = players.findIndex(item => item.id === p.id) + 1;
                  const stats = calculatePlayerStats(p, roomQuestions, roomQuestions.length);

                  return (
                    <div key={p.id} className="bg-[#0C0C12]/90 border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : rank === 2 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30' : rank === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-zinc-400'}`}>
                            #{rank}
                          </span>
                          <div>
                            <p className="text-white font-bold text-base leading-tight">{p.name}</p>
                            <p className="text-xs text-zinc-500 font-mono mt-0.5">Rank #{rank}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-purple-400 font-mono">{p.score.toLocaleString()}</p>
                          <p className="text-[11px] text-zinc-500">pts</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs bg-white/5 px-3 py-2 rounded-xl">
                        <span className="text-zinc-400 font-medium">Correct Answers:</span>
                        <span className="text-white font-bold font-mono text-sm">{stats.correctCount} / {stats.totalQuestions}</span>
                      </div>

                      {showQuestionMatrix && (
                        <div className="pt-2 border-t border-white/5 flex gap-1.5 overflow-x-auto pb-1">
                          {roomQuestions.map((q, qi) => {
                            const ans = p.answers?.[qi];
                            return (
                              <div
                                key={qi}
                                className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center shrink-0 font-bold ${!ans ? 'bg-white/5 text-zinc-600' : ans.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                                title={`Q${qi + 1}: ${ans ? (ans.isCorrect ? 'Correct' : 'Incorrect') : 'Unanswered'}`}
                              >
                                {qi + 1}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Full Leaderboard Table */}
            <div className="hidden md:block bg-[#0C0C12]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="text-center py-4 px-4 text-zinc-400 font-bold uppercase tracking-wider text-xs w-16">Rank</th>
                      <th className="text-left py-4 px-4 text-zinc-400 font-bold uppercase tracking-wider text-xs">Student</th>
                      <th className="text-right py-4 px-4 text-zinc-400 font-bold uppercase tracking-wider text-xs">Total Score</th>
                      <th className="text-center py-4 px-4 text-zinc-400 font-bold uppercase tracking-wider text-xs">Correct Answers</th>
                      {showQuestionMatrix && roomQuestions.map((q, qi) => (
                        <th key={qi} className="text-center py-4 px-2 text-zinc-400 font-bold uppercase tracking-wider text-[11px] w-12">
                          Q{qi + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayedPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={showQuestionMatrix ? 4 + roomQuestions.length : 4} className="text-center py-12 text-zinc-500">
                          No participants found matching &ldquo;{leaderboardSearch}&rdquo;
                        </td>
                      </tr>
                    ) : (
                      displayedPlayers.map((player) => {
                        const rank = players.findIndex(item => item.id === player.id) + 1;
                        const stats = calculatePlayerStats(player, roomQuestions, roomQuestions.length);

                        return (
                          <tr key={player.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="text-center py-3.5 px-4">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : rank === 2 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30' : rank === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-zinc-500 font-bold'}`}>
                                {rank}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                              {player.avatar ? (
                                <img src={player.avatar} className="w-7 h-7 rounded-full bg-white/5 shrink-0" alt="" />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center text-xs text-purple-300 shrink-0 font-bold">
                                  {player.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate max-w-[260px]">{player.name}</span>
                            </td>
                            <td className="text-right py-3.5 px-4 font-mono font-black text-purple-400 text-base">
                              {player.score.toLocaleString()}
                            </td>
                            <td className="text-center py-3.5 px-4 text-zinc-200 font-mono text-sm font-bold">
                              {stats.correctCount} / {stats.totalQuestions}
                            </td>
                            {showQuestionMatrix && roomQuestions.map((q, qi) => {
                              const ans = player.answers?.[qi];
                              let bg = "bg-white/5 text-zinc-600";
                              let letter = "\u2014";
                              if (ans) {
                                letter = String.fromCharCode(65 + ans.selectedOption);
                                bg = ans.isCorrect ? "bg-green-500/20 text-green-400 font-bold" : "bg-red-500/20 text-red-400 font-bold";
                              }
                              return (
                                <td key={qi} className="text-center py-3.5 px-2">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto text-xs ${bg}`}>
                                    {letter}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] flex flex-col relative overflow-hidden p-6 md:p-12">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-2xl">
              <p className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-1">Game PIN</p>
              <div className="text-5xl font-black text-white tracking-widest flex items-center gap-4">
                {pin}
                <button onClick={copyPin} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  {copied ? <CheckCircle2 className="text-green-400" size={28} /> : <Copy className="text-white/40 hover:text-white" size={28} />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-1">Status</p>
              <p className="text-2xl font-bold text-white capitalize">{status === 'waiting' ? 'Waiting for players...' : status === 'playing' ? 'Game in progress!' : 'Game Over'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-6 border-r border-white/10">
              <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-1">Players</p>
              <p className="text-3xl font-black text-white flex items-center gap-2 justify-center"><Users size={24} className="text-purple-400" /> {players.length}</p>
            </div>

            {status === 'waiting' && (
              <button
                onClick={startGame}
                disabled={players.length === 0}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-2xl font-black text-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center gap-2"
              >
                <Play fill="currentColor" size={20} /> START NOW
              </button>
            )}

            {status === 'playing' && (
              <button
                onClick={endGame}
                className="px-8 py-4 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-2xl font-bold text-lg transition-all flex items-center gap-2"
              >
                <StopCircle size={20} /> Force End
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stage */}
          <div className="lg:col-span-2 bg-[#0C0C12]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="text-yellow-500" size={28} />
              <h2 className="text-2xl font-black text-white">{status === 'waiting' ? 'Lobby' : 'Live Leaderboard'}</h2>
            </div>

            {players.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Users className="text-white/10 mb-4" size={64} />
                <p className="text-zinc-500 text-xl font-medium">Waiting for players to join via PIN...</p>
                <p className="text-zinc-600 mt-2">Go to /buiz to join</p>
              </div>
            ) : status === 'waiting' ? (
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Joined Students</span>
                    <span className="px-2 py-0.5 bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-full text-xs font-mono font-bold">
                      {players.length}
                    </span>
                  </div>
                  {players.length > 6 && (
                    <div className="relative w-full sm:w-60">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={lobbySearch}
                        onChange={(e) => setLobbySearch(e.target.value)}
                        className="w-full bg-[#1A1A24]/70 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-wrap gap-2.5 sm:gap-3 items-start content-start overflow-y-auto max-h-[55vh]">
                  <AnimatePresence>
                    {players
                      .filter((p) => p.name.toLowerCase().includes(lobbySearch.toLowerCase().trim()))
                      .map((p) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-purple-600/20 border border-purple-500/30 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm"
                        >
                          {p.avatar ? (
                            <img src={p.avatar} alt="" loading="lazy" className="w-6 h-6 rounded-full bg-black/20 shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-purple-500/40 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                              {p.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <span className="text-white font-bold text-xs sm:text-sm truncate max-w-[140px]">{p.name}</span>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : gameMode === 'ownPace' ? (
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Grid3X3 size={20} className="text-purple-400" />
                      <span className="text-white font-bold text-lg">Own-Pace Progress Matrix</span>
                      <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold font-mono">
                        Async Active
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Students are navigating questions independently at their own speed. The matrix updates live in real-time.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono">
                      <span className="text-zinc-400">Done: </span>
                      <span className="text-green-400 font-bold">
                        {players.filter(p => Object.keys(p.answers || {}).length >= roomQuestions.length).length}/{players.length}
                      </span>
                      <span className="text-zinc-500 ml-2">
                        ({players.length > 0 ? Math.round(players.reduce((sum, p) => sum + (Object.keys(p.answers || {}).length), 0) / players.length / roomQuestions.length * 100) : 0}%)
                      </span>
                    </div>
                    <button
                      onClick={endGame}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Trophy size={14} className="text-yellow-400" /> End Session & Reveal Podium
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 pr-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Player</th>
                        <th className="text-left py-2 pr-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Score</th>
                        {roomQuestions.map((q, qi) => (
                          <th key={qi} className="text-center py-2 px-1.5 text-zinc-400 font-bold uppercase tracking-widest text-[10px] min-w-[42px]">
                            <div>Q{qi + 1}</div>
                            <div className="text-[9px] text-yellow-400/90 font-mono font-normal">{(q.points || 1000)}p</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...players].sort((a, b) => b.score - a.score).map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2.5 pr-4 text-white font-bold flex items-center gap-2">
                            {p.avatar && <img src={p.avatar} className="w-5 h-5 rounded-full" loading="lazy" alt="" />}
                            {p.name}
                          </td>
                          <td className="py-2.5 pr-4 text-purple-400 font-mono font-bold">{p.score.toLocaleString()}</td>
                          {roomQuestions.map((q, qi) => {
                            const answer = p.answers?.[qi];
                            let cellClass = "bg-white/5 text-zinc-600";
                            let cellText = "\u2014";
                            if (answer) {
                              cellText = String.fromCharCode(65 + answer.selectedOption);
                              cellClass = answer.isCorrect ? "bg-green-500/20 text-green-400 font-bold" : "bg-red-500/20 text-red-400 font-bold";
                            }
                            return (
                              <td key={qi} className="text-center py-2.5 px-1.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto text-[11px] ${cellClass}`}>
                                  {cellText}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Answer Distribution & Question Values</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {roomQuestions.map((q, qi) => {
                      const totalAnswers = players.filter(p => p.answers?.[qi]).length;
                      const correctAnswers = players.filter(p => p.answers?.[qi]?.isCorrect).length;
                      return (
                        <div key={qi} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Q{qi + 1}</p>
                            <span className="text-[10px] text-yellow-400 font-mono font-bold">💎 {(q.points || 1000).toLocaleString()} pts</span>
                          </div>
                          <p className="text-white font-bold text-sm truncate">{q.question}</p>
                          <p className="text-xs text-zinc-400 mt-1">{totalAnswers} answers &bull; {correctAnswers} correct ({totalAnswers > 0 ? Math.round(correctAnswers / totalAnswers * 100) : 0}%)</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {roomQuestions[currentQIndex] && (
                  <>
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-white/10 px-4 py-1.5 rounded-full text-white/80 font-bold text-sm">
                          Question {currentQIndex + 1} of {roomQuestions.length}
                        </span>
                        <span className="bg-yellow-500/20 border border-yellow-500/40 px-3 py-1.5 rounded-full text-yellow-300 font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm">
                          <Award size={14} className="text-yellow-400" />
                          <span>💎 {(roomQuestions[currentQIndex]?.points || 1000).toLocaleString()} Points</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 items-center">
                        {questionStatus === 'answering' && (
                          <>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white'}`}>
                              {timeLeft}
                            </div>
                            <button
                              onClick={handleManualReveal}
                              className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                              title="Skip remaining timer and reveal answer immediately"
                            >
                              <Zap size={13} /> Reveal Now
                            </button>
                          </>
                        )}
                        {questionStatus === 'revealed' && (
                          <button
                            onClick={handleManualNextQuestion}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            {currentQIndex + 1 < roomQuestions.length ? (
                              <>Next Question ({currentQIndex + 2}/{roomQuestions.length}) <ChevronRight size={14} /></>
                            ) : (
                              <>Finish Quiz & Show Podium ➔</>
                            )}
                          </button>
                        )}
                        <span className={`px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm ${questionStatus === 'answering' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                          {questionStatus === 'answering' ? `Waiting for answers (${players.filter(p => (p.progress || 0) >= (currentQIndex + 1) / roomQuestions.length).length}/${players.length})` : 'Answer Revealed'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-[#1A1A24] border border-white/10 rounded-2xl p-8 mb-8 text-center shadow-xl">
                      <h2 className="text-3xl font-black text-white">{roomQuestions[currentQIndex].question}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      {roomQuestions[currentQIndex].options.map((opt: string, idx: number) => {
                        const isCorrect = idx === roomQuestions[currentQIndex].answer;
                        let bgClass = "bg-white/5 border-white/10 text-white/50";
                        
                        if (questionStatus === 'revealed') {
                          if (isCorrect) {
                            bgClass = "bg-green-500/20 border-green-500 text-green-400 font-bold shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                          } else {
                            bgClass = "bg-white/5 border-white/10 text-white/20 opacity-50";
                          }
                        } else {
                          bgClass = "bg-white/10 border-white/20 text-white";
                        }
                        
                        return (
                          <div key={idx} className={`p-6 rounded-xl border text-xl flex items-center transition-all ${bgClass}`}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black bg-black/20 mr-4 shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">Top Players</h3>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {players.slice(0, 5).map((p, idx) => (
                          <div key={p.id} className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3 shrink-0">
                            <span className="text-zinc-500 font-bold">#{idx + 1}</span>
                            <span className="text-white font-bold">{p.name}</span>
                            <span className="text-purple-400 font-mono font-bold">{p.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Side Info */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-6">Game Info</h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs text-purple-300/70 font-bold uppercase tracking-widest mb-2">Instructions</p>
                <ol className="text-sm text-zinc-300 space-y-3 list-decimal list-inside">
                  {gameMode === 'hostPaced' ? (
                    <>
                      <li>Share the PIN with students.</li>
                      <li>Students go to <b>/buiz</b> to join.</li>
                      <li>Wait for all students to appear on the leaderboard.</li>
                      <li>Click <b>START NOW</b>.</li>
                      <li>Students will answer each question in sync with the host timer.</li>
                    </>
                  ) : (
                    <>
                      <li>Share the PIN with students.</li>
                      <li>Students go to <b>/buiz</b> to join.</li>
                      <li>Wait for all students to appear on the leaderboard.</li>
                      <li>Click <b>START NOW</b>.</li>
                      <li>Students answer all questions at their own pace. Watch the progress matrix fill up in real-time!</li>
                    </>
                  )}
                </ol>
              </div>

              <div className="pt-6 border-t border-purple-500/20">
                <p className="text-xs text-purple-300/70 font-bold uppercase tracking-widest mb-2">Current Mode</p>
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                  <p className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    {gameMode === 'hostPaced' ? <Clock size={14} className="text-purple-400" /> : <Zap size={14} className="text-green-400" />}
                    {gameMode === 'hostPaced' ? 'Host Paced (Kahoot Style)' : 'Own Pace (Async)'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {gameMode === 'hostPaced' 
                      ? 'Host controls the question flow. Students answer in real-time on their devices.'
                      : 'Students answer at their own pace. Host sees live progress in the matrix.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuizHost;
