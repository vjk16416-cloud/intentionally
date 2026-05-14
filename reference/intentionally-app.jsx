import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Heart, Calendar, Video, MessageSquare, User, Compass, ChevronLeft, Info, Mic, Phone, ChevronRight, MapPin, Clock, Shield, Star, Send, Smile, Filter, Check, Sparkles, Settings, Eye, EyeOff, ThumbsUp, Coffee, Wine, Utensils, Camera, Users, Award } from 'lucide-react';

// ---------- shared design tokens ----------
const C = {
  primary: '#FF5A6E',
  primaryDark: '#E63E54',
  primarySoft: '#FFE5E8',
  primaryFaint: '#FFF5F6',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E5E7EB',
  bg: '#FFFFFF',
  bgSubtle: '#F9FAFB',
};

// ---------- avatar component (gradient + initial fallback) ----------
const gradients = [
  ['#FFB199', '#FF6F91'],
  ['#A8E6CF', '#7FC8A9'],
  ['#FFD3A5', '#FD9853'],
  ['#C7CEEA', '#7986CB'],
  ['#FFAAA5', '#FF8B94'],
  ['#B5EAD7', '#92C9B1'],
  ['#FFDAC1', '#FFB088'],
  ['#E0BBE4', '#957DAD'],
];

function Avatar({ name, size = 48, ring = false }) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const [from, to] = gradients[hash % gradients.length];
  const initial = name[0];
  return (
    <div
      className={`flex items-center justify-center font-semibold text-white shrink-0 ${ring ? 'ring-2 ring-white' : ''}`}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize: size * 0.4,
      }}
    >
      {initial}
    </div>
  );
}

function PortraitCard({ name, gradientIdx, children, className = '' }) {
  const [from, to] = gradients[gradientIdx % gradients.length];
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      {/* abstract face suggestion */}
      <div
        className="absolute"
        style={{
          width: '70%', height: '70%',
          left: '15%', top: '12%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.35), transparent 60%)`,
          filter: 'blur(8px)',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '40%', height: '40%',
          left: '30%', top: '20%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.08), transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

// ---------- top bar ----------
function TopBar({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 bg-white border-b" style={{ borderColor: C.border }}>
      <div className="flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} className="p-1 -ml-1">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <span className="font-script text-2xl" style={{ color: C.primary, fontFamily: 'Caveat, cursive', lineHeight: 1 }}>Intentionally</span>
        )}
        {title && <span className="font-semibold text-lg">{title}</span>}
      </div>
      {right || (
        <button className="p-2 rounded-full hover:bg-gray-50">
          <Bell size={20} />
        </button>
      )}
    </div>
  );
}

// ---------- bottom nav ----------
function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'qa', label: 'Q&A', icon: Video },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  return (
    <div className="bg-white border-t flex items-center justify-around py-3" style={{ borderColor: C.border }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="flex flex-col items-center gap-1 px-3"
            style={{ color: isActive ? C.primary : C.textMuted }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-xs font-medium">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- DISCOVER SCREEN ----------
function DiscoverScreen({ go }) {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* date strip */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <span className="text-sm" style={{ color: C.textMuted }}>Tuesday, June 3</span>
        <span className="text-sm" style={{ color: C.textMuted }}>Upcoming Q&A: 2</span>
      </div>

      {/* hero profile card */}
      <div className="px-5">
        <div
          onClick={() => go('profileDetail')}
          className="relative rounded-3xl overflow-hidden cursor-pointer"
          style={{ aspectRatio: '0.85' }}
        >
          <PortraitCard name="Emma" gradientIdx={0} className="absolute inset-0">
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
              <Video size={12} color="white" />
              <span className="text-xs text-white font-medium">Video Profile</span>
            </div>
            <button className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
              <Info size={16} color="white" />
            </button>

            {/* gradient overlay for legibility */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 50%)' }} />

            {/* name + bio + ask me prompt */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="text-white text-2xl font-bold leading-tight">Emma, 28</div>
              <div className="text-white/90 text-sm mb-3">Product Designer · 3 miles away</div>
              <div className="rounded-2xl p-3 mb-3" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)' }}>
                <div className="text-xs text-white/80 mb-1">Ask me about...</div>
                <div className="text-white text-sm font-medium">"My backpacking trip through Southeast Asia"</div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['Travel', 'Photography', 'Hiking'].map(t => (
                  <span key={t} className="text-xs text-white px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>{t}</span>
                ))}
              </div>
            </div>
          </PortraitCard>

          {/* action buttons */}
          <button className="absolute bottom-5 left-5 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
            <X size={22} color={C.textMuted} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go('match'); }}
            className="absolute bottom-5 right-5 w-12 h-12 rounded-full shadow-md flex items-center justify-center"
            style={{ background: C.primary }}
          >
            <Heart size={22} color="white" fill="white" />
          </button>
        </div>
      </div>

      {/* upcoming Q&A sessions */}
      <div className="px-5 mt-7">
        <h3 className="font-bold text-lg mb-3">Upcoming Q&A Sessions</h3>
        <div className="space-y-3">
          <SessionCard name="Michael" age={30} when="Today, 7:30 PM" badge="In 2 hours" gradientIdx={3} primaryAction="Join Q&A" onPrimary={() => go('qaWaiting')} />
          <SessionCard name="Sophia" age={26} when="Tomorrow, 6:00 PM" badge="Tomorrow" badgeMuted gradientIdx={1} primaryAction="Remind Me" muted />
        </div>
      </div>

      {/* new matches */}
      <div className="mt-7">
        <h3 className="font-bold text-lg mb-3 px-5">New Matches</h3>
        <div className="flex gap-3 overflow-x-auto px-5 pb-2">
          {[
            { name: 'Jessica', age: 27, gradientIdx: 4 },
            { name: 'David', age: 29, gradientIdx: 3 },
            { name: 'Olivia', age: 25, gradientIdx: 7 },
            { name: 'James', age: 31, gradientIdx: 5 },
          ].map(m => (
            <div key={m.name} className="shrink-0" style={{ width: 140 }}>
              <PortraitCard name={m.name} gradientIdx={m.gradientIdx} className="rounded-2xl overflow-hidden" >
                <div style={{ aspectRatio: '0.9' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 50%)' }} />
                <div className="absolute bottom-2 left-3 text-white font-semibold text-sm">{m.name}, {m.age}</div>
              </PortraitCard>
              <button
                onClick={() => go('qaSchedule')}
                className="w-full mt-2 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: C.primary }}
              >
                Schedule Q&A
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* unlocked conversations */}
      <div className="px-5 mt-7 mb-6">
        <h3 className="font-bold text-lg mb-3">Unlocked Conversations</h3>
        <div className="space-y-3">
          <ConvoCard name="Rachel" age={28} when="Q&A completed yesterday" gradientIdx={0} go={go} />
          <ConvoCard name="James" age={31} when="Q&A completed 2 days ago" gradientIdx={2} go={go} />
        </div>
      </div>
    </div>
  );
}

function SessionCard({ name, age, when, badge, badgeMuted, gradientIdx, primaryAction, onPrimary, muted }) {
  return (
    <div className="rounded-2xl border p-3 flex items-center gap-3" style={{ borderColor: C.border }}>
      <Avatar name={name} size={44} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{name}, {age}</div>
        <div className="text-sm" style={{ color: C.textMuted }}>{when}</div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{
            background: badgeMuted ? '#F3F4F6' : C.primarySoft,
            color: badgeMuted ? C.textMuted : C.primary,
          }}
        >{badge}</span>
      </div>
      <button
        onClick={onPrimary}
        className="ml-1 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5"
        style={{
          background: muted ? '#F3F4F6' : C.primary,
          color: muted ? C.textMuted : 'white',
        }}
      >
        {primaryAction.includes('Join') ? <Video size={14} /> : <Clock size={14} />}
        {primaryAction}
      </button>
    </div>
  );
}

function ConvoCard({ name, age, when, gradientIdx, go }) {
  return (
    <div
      onClick={() => go('chat')}
      className="rounded-2xl border p-3 flex items-center gap-3 cursor-pointer"
      style={{ borderColor: C.border }}
    >
      <Avatar name={name} size={44} />
      <div className="flex-1">
        <div className="font-semibold">{name}, {age}</div>
        <div className="text-sm" style={{ color: C.textMuted }}>{when}</div>
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.primaryFaint }}>
        <MessageSquare size={16} color={C.primary} />
      </div>
    </div>
  );
}

// ---------- PROFILE DETAIL (expanded) ----------
function ProfileDetailScreen({ go }) {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="relative" style={{ height: 480 }}>
        <PortraitCard name="Emma" gradientIdx={0} className="absolute inset-0">
          <button onClick={() => go('discover')} className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
            <ChevronLeft size={20} color="white" />
          </button>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)' }} />
          <div className="absolute bottom-0 p-5 text-white">
            <div className="text-3xl font-bold">Emma, 28</div>
            <div className="text-sm opacity-90 mb-2">Product Designer · 3 miles</div>
            <div className="flex items-center gap-1.5">
              <Shield size={14} />
              <span className="text-xs">ID verified · Completes 9/10 Q&As</span>
            </div>
          </div>
        </PortraitCard>
      </div>

      <div className="px-5 py-5 space-y-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.textMuted }}>Looking for</div>
          <div className="flex gap-2 flex-wrap">
            {['Serious relationship', 'Long-term'].map(t => (
              <span key={t} className="text-sm px-3 py-1.5 rounded-full font-medium" style={{ background: C.primarySoft, color: C.primary }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.bgSubtle }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.textMuted }}>About me</div>
          <div className="text-base">Curious by nature, big on slow mornings and proper conversations. Recently got back into film photography after a 10-year break.</div>
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.bgSubtle }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.textMuted }}>A perfect Sunday looks like...</div>
          <div className="text-base">Coffee at 8, market walk, friend's house for lunch, long nothing-afternoon, dinner I cook badly but enthusiastically.</div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.textMuted }}>Interests</div>
          <div className="flex gap-2 flex-wrap">
            {['Travel', 'Photography', 'Hiking', 'Cooking', 'Live music', 'Bouldering'].map(t => (
              <span key={t} className="text-sm px-3 py-1.5 rounded-full border" style={{ borderColor: C.border }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3" style={{ borderColor: C.border }}>
        <button onClick={() => go('discover')} className="w-14 h-14 rounded-full bg-white border flex items-center justify-center" style={{ borderColor: C.border }}>
          <X size={22} color={C.textMuted} />
        </button>
        <button onClick={() => go('match')} className="flex-1 rounded-2xl text-white font-semibold flex items-center justify-center gap-2" style={{ background: C.primary }}>
          <Heart size={18} fill="white" /> Like Emma
        </button>
      </div>
    </div>
  );
}

// ---------- MATCH MODAL ----------
function MatchScreen({ go }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8" style={{ background: `linear-gradient(160deg, ${C.primary}, #FF8FA3)` }}>
      <div className="absolute top-5 right-5">
        <button onClick={() => go('discover')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <X size={20} color="white" />
        </button>
      </div>

      <Sparkles size={40} color="white" className="mb-4" />
      <div className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Caveat, cursive' }}>It's a match!</div>
      <div className="text-white/90 mb-10 max-w-xs">You and Emma both want to know more. Time to set up your Q&A.</div>

      <div className="flex items-center gap-4 mb-10">
        <Avatar name="You" size={90} ring />
        <Heart size={28} color="white" fill="white" />
        <Avatar name="Emma" size={90} ring />
      </div>

      <button onClick={() => go('qaSchedule')} className="w-full max-w-xs py-4 rounded-2xl font-semibold bg-white" style={{ color: C.primary }}>
        Schedule your Q&A
      </button>
      <button onClick={() => go('discover')} className="w-full max-w-xs py-4 mt-3 text-white/90 font-medium">
        Keep swiping
      </button>
    </div>
  );
}

// ---------- Q&A SCHEDULE ----------
function QaScheduleScreen({ go }) {
  const [selected, setSelected] = useState('thu-7');
  const slots = [
    { id: 'wed-6', day: 'Wed', date: 'Jun 4', time: '6:00 PM' },
    { id: 'wed-7', day: 'Wed', date: 'Jun 4', time: '7:30 PM' },
    { id: 'thu-6', day: 'Thu', date: 'Jun 5', time: '6:00 PM' },
    { id: 'thu-7', day: 'Thu', date: 'Jun 5', time: '7:30 PM' },
    { id: 'fri-6', day: 'Fri', date: 'Jun 6', time: '6:00 PM' },
    { id: 'sat-3', day: 'Sat', date: 'Jun 7', time: '3:00 PM' },
  ];
  return (
    <div className="flex-1 flex flex-col bg-white">
      <TopBar title="Schedule Q&A" onBack={() => go('discover')} right={<span />} />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: C.primaryFaint }}>
          <Avatar name="Emma" size={48} />
          <div className="flex-1">
            <div className="font-semibold">10-min Q&A with Emma</div>
            <div className="text-sm" style={{ color: C.textMuted }}>3 therapist-designed questions</div>
          </div>
        </div>

        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.textMuted }}>Pick a time you're both free</div>
        <div className="grid grid-cols-2 gap-3">
          {slots.map(s => {
            const isSel = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className="rounded-2xl border p-4 text-left transition-all"
                style={{
                  borderColor: isSel ? C.primary : C.border,
                  background: isSel ? C.primaryFaint : 'white',
                  borderWidth: isSel ? 2 : 1,
                }}
              >
                <div className="text-xs" style={{ color: C.textMuted }}>{s.day} · {s.date}</div>
                <div className="font-semibold mt-1">{s.time}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-2xl border" style={{ borderColor: C.border }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: C.primarySoft }}>
              <Info size={16} color={C.primary} />
            </div>
            <div className="text-sm">
              <div className="font-semibold mb-0.5">How it works</div>
              <div style={{ color: C.textMuted }}>You'll see the questions 5 minutes before. During each answer, the listener is blurred — to take the pressure off.</div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t" style={{ borderColor: C.border }}>
        <button onClick={() => go('qaWaiting')} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ background: C.primary }}>
          Send invitation
        </button>
      </div>
    </div>
  );
}

// ---------- Q&A WAITING ROOM ----------
function QaWaitingScreen({ go }) {
  const [seconds, setSeconds] = useState(58);
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const questions = [
    "What's something you've changed your mind about recently?",
    "When do you feel most like yourself?",
    "What does a good week look like for you?",
  ];

  return (
    <div className="flex-1 flex flex-col bg-white">
      <TopBar title="Q&A starting soon" onBack={() => go('discover')} right={<span />} />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Avatar name="You" size={72} />
            <div className="w-10 h-px" style={{ background: C.border }} />
            <Avatar name="Emma" size={72} />
          </div>
          <div className="text-2xl font-bold">Q&A with Emma</div>
          <div className="text-5xl font-bold mt-3" style={{ color: C.primary, fontVariantNumeric: 'tabular-nums' }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <div className="text-sm mt-2" style={{ color: C.textMuted }}>until your session starts</div>
        </div>

        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.textMuted }}>Today's questions — preview</div>
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="rounded-2xl border p-4 flex gap-3" style={{ borderColor: C.border }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: C.primarySoft, color: C.primary }}>
                {i + 1}
              </div>
              <div className="text-sm pt-1.5">{q}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-2xl flex items-start gap-3" style={{ background: C.bgSubtle }}>
          <Sparkles size={18} color={C.primary} className="shrink-0 mt-0.5" />
          <div className="text-sm" style={{ color: C.textMuted }}>
            You can swap one question if you want. Decide with Emma at the start.
          </div>
        </div>
      </div>
      <div className="p-4 border-t" style={{ borderColor: C.border }}>
        <button onClick={() => go('qaLive')} className="w-full py-4 rounded-2xl text-white font-semibold flex items-center justify-center gap-2" style={{ background: C.primary }}>
          <Video size={18} /> Enter Q&A room
        </button>
      </div>
    </div>
  );
}

// ---------- Q&A LIVE — THE HERO FEATURE ----------
function QaLiveScreen({ go }) {
  const [whoAnswers, setWhoAnswers] = useState('them'); // 'them' or 'you'
  const [questionIdx, setQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(58);
  const [showReaction, setShowReaction] = useState(null);

  const questions = [
    "What's something you've changed your mind about recently?",
    "When do you feel most like yourself?",
    "What does a good week look like for you?",
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // toggle speaker or advance question
          setWhoAnswers(w => w === 'them' ? 'you' : 'them');
          return 58;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const sendReaction = (emoji) => {
    setShowReaction(emoji);
    setTimeout(() => setShowReaction(null), 1500);
  };

  const speakerIsThem = whoAnswers === 'them';

  return (
    <div className="flex-1 relative overflow-hidden" style={{ background: '#0F172A' }}>
      {/* Speaker fullscreen (clear) */}
      <div className="absolute inset-0">
        <PortraitCard
          name={speakerIsThem ? 'Emma' : 'You'}
          gradientIdx={speakerIsThem ? 0 : 6}
          className="w-full h-full"
        >
          {/* animated audio bars suggesting speech */}
          <div className="absolute bottom-32 left-0 right-0 flex items-end justify-center gap-1.5 h-16">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-white/70"
                style={{
                  height: `${20 + Math.sin((Date.now() / 200) + i) * 25 + Math.random() * 20}%`,
                  animation: `pulse${i % 3} ${0.6 + (i % 4) * 0.15}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
        </PortraitCard>
      </div>

      {/* Top: question card */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12 z-10">
        <div className="rounded-2xl p-4" style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: C.primary, color: 'white' }}>
                Q{questionIdx + 1}/3
              </div>
              <div className="text-xs text-white/70">
                {speakerIsThem ? 'Emma is answering' : 'Your turn'}
              </div>
            </div>
            <div className="text-white text-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              0:{String(timeLeft).padStart(2, '0')}
            </div>
          </div>
          <div className="text-white text-base font-semibold leading-snug">
            {questions[questionIdx]}
          </div>
          {/* progress bar */}
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${((58 - timeLeft) / 58) * 100}%`, background: C.primary }}
            />
          </div>
        </div>
      </div>

      {/* Listener PIP — BLURRED (the hero feature) */}
      <div className="absolute top-32 right-4 z-10">
        <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20" style={{ width: 110, height: 140 }}>
          <div className="relative w-full h-full">
            <PortraitCard
              name={speakerIsThem ? 'You' : 'Emma'}
              gradientIdx={speakerIsThem ? 6 : 0}
              className="w-full h-full"
            >
              {/* THE BLUR */}
              <div className="absolute inset-0 backdrop-blur-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
            </PortraitCard>
            <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between">
              <span className="text-xs text-white font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                {speakerIsThem ? 'You' : 'Emma'}
              </span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <Mic size={11} color="white" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="text-xs text-white/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
            <EyeOff size={11} /> Listener blurred
          </div>
        </div>
      </div>

      {/* Floating reaction */}
      {showReaction && (
        <div className="absolute left-1/2 top-1/2 z-20 text-6xl pointer-events-none"
          style={{
            transform: 'translate(-50%, -50%)',
            animation: 'floatUp 1.5s ease-out forwards',
          }}>
          {showReaction}
        </div>
      )}

      {/* Bottom: reactions + controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-7 z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          {['😊', '🥹', '😂', '👏', '❤️'].map(e => (
            <button
              key={e}
              onClick={() => sendReaction(e)}
              className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}>
            <Mic size={20} color="white" />
          </button>
          <button
            onClick={() => {
              if (questionIdx < 2) {
                setQuestionIdx(i => i + 1);
                setTimeLeft(58);
                setWhoAnswers('them');
              } else {
                go('qaComplete');
              }
            }}
            className="px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2"
            style={{ background: 'white', color: C.text }}
          >
            {questionIdx < 2 ? 'Next question' : 'End session'} <ChevronRight size={16} />
          </button>
          <button onClick={() => go('qaComplete')} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C.primary }}>
            <Phone size={18} color="white" style={{ transform: 'rotate(135deg)' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse0 { from { height: 20%; } to { height: 70%; } }
        @keyframes pulse1 { from { height: 35%; } to { height: 85%; } }
        @keyframes pulse2 { from { height: 15%; } to { height: 55%; } }
        @keyframes floatUp {
          0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -150%) scale(0.8); }
        }
      `}</style>
    </div>
  );
}

// ---------- Q&A COMPLETE / MUTUAL UNLOCK ----------
function QaCompleteScreen({ go }) {
  const [choice, setChoice] = useState(null);

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: C.primarySoft }}>
            <Check size={28} color={C.primary} strokeWidth={3} />
          </div>
          <div className="text-2xl font-bold">Q&A complete</div>
          <div className="text-sm mt-1" style={{ color: C.textMuted }}>How did it feel?</div>
        </div>

        <div className="rounded-3xl p-5 mb-5" style={{ background: C.bgSubtle }}>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.textMuted }}>Q&A recap</div>
          <div className="space-y-3">
            {[
              { icon: '✨', text: 'Emma changed her mind about leaving London this year.' },
              { icon: '🌿', text: 'She feels most herself when she\'s walking somewhere new.' },
              { icon: '☕', text: 'Her good week: friends Friday, garden Sunday, slow start Monday.' },
            ].map((r, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="text-lg">{r.icon}</div>
                <div className="flex-1">{r.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-base font-semibold mb-1 text-center">Unlock chat with Emma?</div>
        <div className="text-sm mb-5 text-center" style={{ color: C.textMuted }}>You both need to agree.</div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { id: 'no', label: 'No', sub: 'Not for me', color: '#F3F4F6', textColor: C.text },
            { id: 'later', label: 'Not now', sub: 'Revisit later', color: '#FEF3C7', textColor: '#92400E' },
            { id: 'yes', label: 'Yes', sub: 'Unlock chat', color: C.primary, textColor: 'white' },
          ].map(opt => {
            const isSel = choice === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setChoice(opt.id)}
                className="rounded-2xl p-4 text-center transition-all"
                style={{
                  background: opt.color,
                  color: opt.textColor,
                  boxShadow: isSel ? `0 0 0 3px ${C.primary}` : 'none',
                }}
              >
                <div className="font-bold text-lg">{opt.label}</div>
                <div className="text-xs mt-0.5 opacity-80">{opt.sub}</div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border p-4 flex items-start gap-3" style={{ borderColor: C.border }}>
          <Star size={18} color={C.primary} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold mb-0.5">Optional feedback for Emma</div>
            <div style={{ color: C.textMuted }}>If you decline, you can leave private feedback to help her improve.</div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t" style={{ borderColor: C.border }}>
        <button
          onClick={() => choice === 'yes' ? go('chat') : go('discover')}
          disabled={!choice}
          className="w-full py-4 rounded-2xl font-semibold disabled:opacity-40 text-white"
          style={{ background: C.primary }}
        >
          Submit decision
        </button>
      </div>
    </div>
  );
}

// ---------- CHAT ----------
function ChatScreen({ go }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'them', text: 'Hey! That was lovely — felt easier than I expected.', time: '7:42 PM' },
    { from: 'you', text: 'Same. Honestly the blur made me forget I was on camera for a sec.', time: '7:45 PM' },
    { from: 'them', text: 'Ha right? Loved your answer about the photography thing 📸', time: '7:46 PM' },
    { from: 'you', text: 'I owe you a coffee for the SE Asia stories. Borough Market this weekend?', time: '7:50 PM' },
  ]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: 'you', text: input, time: 'now' }]);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: C.border }}>
        <button onClick={() => go('discover')}><ChevronLeft size={24} /></button>
        <Avatar name="Emma" size={40} />
        <div className="flex-1">
          <div className="font-semibold">Emma, 28</div>
          <div className="text-xs flex items-center gap-1" style={{ color: C.textMuted }}>
            <Shield size={11} /> Verified · Online
          </div>
        </div>
        <button onClick={() => go('datePlan')} className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5" style={{ background: C.primarySoft, color: C.primary }}>
          <Calendar size={14} /> Plan date
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: C.bgSubtle }}>
        <div className="text-center text-xs px-3 py-2 rounded-full inline-block mx-auto" style={{ color: C.textMuted, background: 'white' }}>
          <span className="inline-flex items-center gap-1.5"><Check size={11} /> Chat unlocked after your Q&A</span>
        </div>

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'you' ? 'justify-end' : 'justify-start'}`}>
            {m.from === 'them' && <Avatar name="Emma" size={28} />}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 mx-2 ${m.from === 'you' ? 'rounded-br-md' : 'rounded-bl-md'}`}
              style={{
                background: m.from === 'you' ? C.primary : 'white',
                color: m.from === 'you' ? 'white' : C.text,
              }}>
              <div className="text-sm">{m.text}</div>
              <div className="text-[10px] mt-1 opacity-70">{m.time}</div>
            </div>
          </div>
        ))}

        <div className="rounded-2xl p-3 border-2 border-dashed mt-4" style={{ borderColor: C.primary, background: C.primaryFaint }}>
          <div className="text-xs font-semibold mb-1" style={{ color: C.primary }}>SUGGESTED PROMPT</div>
          <div className="text-sm">Saturday 11am at Monmouth Coffee? It's a 5 min walk from Borough.</div>
        </div>
      </div>

      <div className="border-t p-3 flex items-center gap-2" style={{ borderColor: C.border }}>
        <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.bgSubtle }}>
          <Smile size={20} color={C.textMuted} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Message Emma..."
          className="flex-1 px-4 py-2.5 rounded-full text-sm focus:outline-none"
          style={{ background: C.bgSubtle }}
        />
        <button onClick={send} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.primary }}>
          <Send size={18} color="white" />
        </button>
      </div>
    </div>
  );
}

// ---------- DATE PLANNING ----------
function DatePlanScreen({ go }) {
  const venues = [
    { name: 'Monmouth Coffee', type: 'Coffee', icon: Coffee, distance: '0.4mi', badge: 'Verified safe', match: '94%' },
    { name: 'Borough Market', type: 'Walk & food', icon: Utensils, distance: '0.5mi', badge: 'Verified safe', match: '88%' },
    { name: 'Gordon\'s Wine Bar', type: 'Wine', icon: Wine, distance: '1.1mi', badge: 'Verified safe', match: '82%' },
  ];
  return (
    <div className="flex-1 flex flex-col bg-white">
      <TopBar title="Plan your date" onBack={() => go('chat')} right={<span />} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: C.primaryFaint }}>
          <Avatar name="Emma" size={40} />
          <div className="flex-1 text-sm">
            <div className="font-semibold">Date with Emma</div>
            <div style={{ color: C.textMuted }}>Saturday, 11:00 AM</div>
          </div>
          <button className="text-sm font-semibold" style={{ color: C.primary }}>Change</button>
        </div>

        <div className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.textMuted }}>Suggested venues near you both</div>
          <div className="space-y-3">
            {venues.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: i === 0 ? C.primary : C.border, borderWidth: i === 0 ? 2 : 1 }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: C.primaryFaint }}>
                    <Icon size={22} color={C.primary} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-sm" style={{ color: C.textMuted }}>{v.type} · {v.distance}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Shield size={11} color={C.primary} />
                      <span className="text-xs font-medium" style={{ color: C.primary }}>{v.badge}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{v.match}</div>
                    <div className="text-xs" style={{ color: C.textMuted }}>match</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl p-4" style={{ background: C.bgSubtle }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.textMuted }}>Safety setup</div>
            <SafetyRow icon={Phone} title="Phone number reveal" sub="3 hours before the date" />
            <SafetyRow icon={Users} title="Trusted contact alert" sub="Sarah will know when you leave" />
            <SafetyRow icon={MapPin} title="Live location sharing" sub="Active during the date" />
            <SafetyRow icon={Check} title="Post-date safety check" sub="'I'm home safe' tap" last />
          </div>
        </div>
      </div>

      <div className="p-4 border-t" style={{ borderColor: C.border }}>
        <button onClick={() => go('chat')} className="w-full py-4 rounded-2xl text-white font-semibold" style={{ background: C.primary }}>
          Suggest Monmouth Coffee to Emma
        </button>
      </div>
    </div>
  );
}

function SafetyRow({ icon: Icon, title, sub, last }) {
  return (
    <div className={`flex items-center gap-3 py-2.5 ${!last ? 'border-b' : ''}`} style={{ borderColor: '#E5E7EB' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'white' }}>
        <Icon size={16} color={C.primary} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs" style={{ color: C.textMuted }}>{sub}</div>
      </div>
      <Check size={16} color={C.primary} />
    </div>
  );
}

// ---------- Q&A TAB ----------
function QaTabScreen({ go }) {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <TopBar title="" />
      <div className="px-5 pt-3 pb-2">
        <h2 className="text-2xl font-bold">Your Q&As</h2>
      </div>

      <div className="px-5 pb-5">
        <div className="text-xs font-semibold uppercase tracking-wide my-3" style={{ color: C.textMuted }}>Today</div>
        <SessionCard name="Michael" age={30} when="Today, 7:30 PM" badge="In 2 hours" gradientIdx={3} primaryAction="Join Q&A" onPrimary={() => go('qaWaiting')} />

        <div className="text-xs font-semibold uppercase tracking-wide my-3 mt-5" style={{ color: C.textMuted }}>Upcoming</div>
        <div className="space-y-3">
          <SessionCard name="Sophia" age={26} when="Wed, 6:00 PM" badge="Wednesday" badgeMuted gradientIdx={1} primaryAction="Remind Me" muted />
          <SessionCard name="Jessica" age={27} when="Thu, 7:30 PM" badge="Thursday" badgeMuted gradientIdx={4} primaryAction="Remind Me" muted />
        </div>

        <div className="text-xs font-semibold uppercase tracking-wide my-3 mt-5" style={{ color: C.textMuted }}>Completed</div>
        <div className="space-y-3">
          {[
            { name: 'Rachel', age: 28, sub: 'Yesterday · You unlocked chat', gradientIdx: 0 },
            { name: 'James', age: 31, sub: '2 days ago · You unlocked chat', gradientIdx: 2 },
            { name: 'Tom', age: 29, sub: '4 days ago · Mutual pass', gradientIdx: 5, muted: true },
          ].map(c => (
            <div key={c.name} className="rounded-2xl border p-3 flex items-center gap-3" style={{ borderColor: C.border, opacity: c.muted ? 0.6 : 1 }}>
              <Avatar name={c.name} size={44} />
              <div className="flex-1">
                <div className="font-semibold">{c.name}, {c.age}</div>
                <div className="text-sm" style={{ color: C.textMuted }}>{c.sub}</div>
              </div>
              <Check size={18} color={C.primary} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- MESSAGES TAB ----------
function MessagesTabScreen({ go }) {
  const convos = [
    { name: 'Emma', age: 28, last: 'Saturday 11am at Monmouth?', time: 'now', unread: 1, gradientIdx: 0 },
    { name: 'Rachel', age: 28, last: 'Loved that café recommendation!', time: '2h', gradientIdx: 0 },
    { name: 'James', age: 31, last: 'Same — when are you free this week?', time: '1d', gradientIdx: 2 },
    { name: 'Sophie', age: 27, last: 'Voice message · 0:23', time: '3d', gradientIdx: 1 },
  ];
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <TopBar title="" />
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Messages</h2>
        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.bgSubtle }}>
          <Filter size={16} />
        </button>
      </div>
      <div className="px-2">
        {convos.map((c, i) => (
          <div key={i} onClick={() => go('chat')} className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-gray-50 cursor-pointer">
            <div className="relative">
              <Avatar name={c.name} size={52} />
              {c.unread && <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: C.primary }}>{c.unread}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{c.name}, {c.age}</div>
                <div className="text-xs" style={{ color: C.textMuted }}>{c.time}</div>
              </div>
              <div className="text-sm truncate" style={{ color: c.unread ? C.text : C.textMuted, fontWeight: c.unread ? 500 : 400 }}>{c.last}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- PROFILE TAB ----------
function ProfileTabScreen({ go }) {
  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <TopBar title="" right={<button className="p-2 rounded-full hover:bg-gray-50"><Settings size={20} /></button>} />

      <div className="px-5 pb-6">
        <div className="flex items-center gap-4 py-3">
          <div className="relative">
            <Avatar name="Vinnie" size={72} />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: 'white' }}>
              <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: C.primary }}>
                <Camera size={12} color="white" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold">Vinnie, 28</div>
            <div className="text-sm flex items-center gap-1" style={{ color: C.textMuted }}>
              <Shield size={12} /> ID Verified
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-5">
          <StatCard label="Q&As" value="12" />
          <StatCard label="Show rate" value="92%" />
          <StatCard label="Matches" value="34" />
        </div>

        <div className="rounded-2xl p-4 mb-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${C.primary}, #FF8FA3)` }}>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Award size={20} color="white" />
          </div>
          <div className="flex-1 text-white">
            <div className="font-semibold">Trusted member</div>
            <div className="text-xs opacity-90">Top 15% completion rate</div>
          </div>
          <ChevronRight size={18} color="white" />
        </div>

        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.textMuted }}>Profile</div>
        <MenuRow icon={User} label="Edit profile" />
        <MenuRow icon={Sparkles} label="Intention & dealbreakers" />
        <MenuRow icon={Calendar} label="Availability" sub="Set when you're free for Q&As" />

        <div className="text-xs font-semibold uppercase tracking-wide mb-2 mt-5" style={{ color: C.textMuted }}>Safety</div>
        <MenuRow icon={Shield} label="Trusted contacts" sub="1 active: Sarah" />
        <MenuRow icon={Users} label="Blocked accounts" />

        <div className="text-xs font-semibold uppercase tracking-wide mb-2 mt-5" style={{ color: C.textMuted }}>Premium</div>
        <MenuRow icon={Star} label="Upgrade to Premium" sub="Priority Q&As, coaching, concierge" highlight last />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: C.bgSubtle }}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>{label}</div>
    </div>
  );
}

function MenuRow({ icon: Icon, label, sub, highlight, last }) {
  return (
    <div className={`flex items-center gap-3 py-3 ${!last ? 'border-b' : ''}`} style={{ borderColor: C.border }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: highlight ? C.primarySoft : C.bgSubtle }}>
        <Icon size={16} color={highlight ? C.primary : C.text} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold" style={{ color: highlight ? C.primary : C.text }}>{label}</div>
        {sub && <div className="text-xs" style={{ color: C.textMuted }}>{sub}</div>}
      </div>
      <ChevronRight size={16} color={C.textMuted} />
    </div>
  );
}

// ---------- MAIN APP ----------
export default function App() {
  const [screen, setScreen] = useState('discover');

  // tabs that show bottom nav
  const tabScreens = ['discover', 'qaTab', 'messagesTab', 'profileTab'];
  const showNav = tabScreens.includes(screen);

  const activeTab = {
    discover: 'discover',
    qaTab: 'qa',
    messagesTab: 'messages',
    profileTab: 'profile',
  }[screen] || 'discover';

  const handleTabChange = (tab) => {
    const map = { discover: 'discover', qa: 'qaTab', messages: 'messagesTab', profile: 'profileTab' };
    setScreen(map[tab]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F1F5F9', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col" style={{ height: '90vh', maxHeight: 900, minHeight: 700 }}>
        {/* status bar simulation */}
        <div className="px-6 pt-2 pb-1 flex items-center justify-between text-xs font-semibold" style={{ background: 'white' }}>
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-black"/><div className="w-1 h-1 rounded-full bg-black"/><div className="w-1 h-1 rounded-full bg-black"/></div>
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {screen !== 'qaLive' && screen !== 'match' && screen === 'discover' && <TopBar />}

        <div className="flex-1 flex flex-col overflow-hidden">
          {screen === 'discover' && <DiscoverScreen go={setScreen} />}
          {screen === 'profileDetail' && <ProfileDetailScreen go={setScreen} />}
          {screen === 'match' && <MatchScreen go={setScreen} />}
          {screen === 'qaSchedule' && <QaScheduleScreen go={setScreen} />}
          {screen === 'qaWaiting' && <QaWaitingScreen go={setScreen} />}
          {screen === 'qaLive' && <QaLiveScreen go={setScreen} />}
          {screen === 'qaComplete' && <QaCompleteScreen go={setScreen} />}
          {screen === 'chat' && <ChatScreen go={setScreen} />}
          {screen === 'datePlan' && <DatePlanScreen go={setScreen} />}
          {screen === 'qaTab' && <QaTabScreen go={setScreen} />}
          {screen === 'messagesTab' && <MessagesTabScreen go={setScreen} />}
          {screen === 'profileTab' && <ProfileTabScreen go={setScreen} />}
        </div>

        {showNav && <BottomNav active={activeTab} onChange={handleTabChange} />}
      </div>

      {/* dev jump menu */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-white rounded-2xl shadow-lg p-3 text-xs" style={{ display: 'none' }}>
        <select value={screen} onChange={e => setScreen(e.target.value)} className="w-full p-2 rounded border">
          <option value="discover">Discover</option>
          <option value="profileDetail">Profile detail</option>
          <option value="match">Match modal</option>
          <option value="qaSchedule">Q&A Schedule</option>
          <option value="qaWaiting">Q&A Waiting</option>
          <option value="qaLive">Q&A Live (hero)</option>
          <option value="qaComplete">Q&A Complete</option>
          <option value="chat">Chat</option>
          <option value="datePlan">Date Planning</option>
          <option value="qaTab">Q&A Tab</option>
          <option value="messagesTab">Messages Tab</option>
          <option value="profileTab">Profile Tab</option>
        </select>
      </div>
    </div>
  );
}
