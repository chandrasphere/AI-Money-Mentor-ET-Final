import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Calculator, 
  Users, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Wallet,
  Target,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { financialMentor } from './services/aiService';
import { UserFinancialData, MoneyHealthScore } from './types';
import { cn } from './lib/utils';
import ReactMarkdown from 'react-markdown';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const INITIAL_DATA: UserFinancialData = {
  age: 25,
  monthlyIncome: 50000,
  monthlyExpenses: 25000,
  currentSavings: 100000,
  investments: {
    equity: 50000,
    debt: 30000,
    gold: 10000,
    realEstate: 0,
  },
  liabilities: 0,
  insurance: {
    health: false,
    life: false,
  },
  goals: [],
};

export default function App() {
  const [step, setStep] = useState<'onboarding' | 'dashboard' | 'tool'>('onboarding');
  const [activeTool, setActiveTool] = useState<'fire' | 'tax' | 'health' | 'chat' | null>(null);
  const [userData, setUserData] = useState<UserFinancialData>(INITIAL_DATA);
  const [healthScore, setHealthScore] = useState<MoneyHealthScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleOnboardingComplete = async () => {
    setLoading(true);
    try {
      const score = await financialMentor.getHealthScore(userData);
      setHealthScore(score);
      setStep('dashboard');
    } catch (error) {
      console.error("Error fetching health score:", error);
    } finally {
      setLoading(false);
    }
  };

  const runTool = async (tool: 'fire' | 'tax' | 'health') => {
    setLoading(true);
    setActiveTool(tool);
    setStep('tool');
    try {
      let response = "";
      if (tool === 'fire') {
        response = await financialMentor.getFIREPlan(userData);
      } else if (tool === 'tax') {
        response = await financialMentor.getTaxAdvice(userData.monthlyIncome * 12, {});
      } else if (tool === 'health') {
        const score = await financialMentor.getHealthScore(userData);
        setHealthScore(score);
        response = "Health score updated!";
      }
      setAiResponse(response);
    } catch (error) {
      setAiResponse("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('dashboard')}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">MoneyMentor</span>
        </div>
        {step !== 'onboarding' && (
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <button onClick={() => setStep('dashboard')} className="hover:text-orange-500 transition-colors">Dashboard</button>
            <button onClick={() => runTool('fire')} className="hover:text-orange-500 transition-colors">FIRE Planner</button>
            <button onClick={() => runTool('tax')} className="hover:text-orange-500 transition-colors">Tax Wizard</button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'onboarding' && (
            <Onboarding 
              data={userData} 
              setData={setUserData} 
              onComplete={handleOnboardingComplete} 
              loading={loading}
            />
          )}

          {step === 'dashboard' && (
            <Dashboard 
              userData={userData} 
              healthScore={healthScore} 
              onRunTool={runTool}
            />
          )}

          {step === 'tool' && (
            <ToolView 
              tool={activeTool} 
              response={aiResponse} 
              loading={loading} 
              onBack={() => setStep('dashboard')}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Floating Chat Trigger */}
      {step !== 'onboarding' && (
        <button 
          className="fixed bottom-8 right-8 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-200 flex items-center justify-center hover:scale-110 transition-transform z-50"
          onClick={() => {
            setActiveTool('chat');
            setStep('tool');
            setAiResponse("Hello! I'm your AI Money Mentor. How can I help you today? You can ask about FIRE, taxes, or your portfolio.");
          }}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

function Onboarding({ data, setData, onComplete, loading }: { 
  data: UserFinancialData, 
  setData: React.Dispatch<React.SetStateAction<UserFinancialData>>, 
  onComplete: () => void,
  loading: boolean
}) {
  const [currentSubStep, setCurrentSubStep] = useState(0);

  const steps = [
    { title: "The Basics", description: "Let's start with your age and income." },
    { title: "Monthly Flow", description: "How much do you spend and save?" },
    { title: "Current Wealth", description: "What does your portfolio look like?" },
    { title: "Safety Net", description: "Are you covered for emergencies?" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome to Financial Clarity</h1>
        <p className="text-gray-500">Answer a few questions to get your personalized financial roadmap.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              i <= currentSubStep ? "bg-orange-500" : "bg-gray-100"
            )} />
          ))}
        </div>

        <h2 className="text-2xl font-semibold mb-2">{steps[currentSubStep].title}</h2>
        <p className="text-gray-500 mb-8 text-sm">{steps[currentSubStep].description}</p>

        <div className="space-y-6">
          {currentSubStep === 0 && (
            <>
              <InputGroup label="Your Age" value={data.age} onChange={(v) => setData({...data, age: Number(v)})} type="number" />
              <InputGroup label="Monthly Income (₹)" value={data.monthlyIncome} onChange={(v) => setData({...data, monthlyIncome: Number(v)})} type="number" />
            </>
          )}
          {currentSubStep === 1 && (
            <>
              <InputGroup label="Monthly Expenses (₹)" value={data.monthlyExpenses} onChange={(v) => setData({...data, monthlyExpenses: Number(v)})} type="number" />
              <InputGroup label="Current Monthly Savings (₹)" value={data.currentSavings} onChange={(v) => setData({...data, currentSavings: Number(v)})} type="number" />
            </>
          )}
          {currentSubStep === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Equity (MF/Stocks)" value={data.investments.equity} onChange={(v) => setData({...data, investments: {...data.investments, equity: Number(v)}})} type="number" />
              <InputGroup label="Debt (FD/PPF)" value={data.investments.debt} onChange={(v) => setData({...data, investments: {...data.investments, debt: Number(v)}})} type="number" />
              <InputGroup label="Gold" value={data.investments.gold} onChange={(v) => setData({...data, investments: {...data.investments, gold: Number(v)}})} type="number" />
              <InputGroup label="Real Estate" value={data.investments.realEstate} onChange={(v) => setData({...data, investments: {...data.investments, realEstate: Number(v)}})} type="number" />
            </div>
          )}
          {currentSubStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors cursor-pointer" onClick={() => setData({...data, insurance: {...data.insurance, health: !data.insurance.health}})}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className={cn("w-6 h-6", data.insurance.health ? "text-green-500" : "text-gray-300")} />
                  <div>
                    <p className="font-medium">Health Insurance</p>
                    <p className="text-xs text-gray-400">Do you have a personal health cover?</p>
                  </div>
                </div>
                {data.insurance.health && <CheckCircle2 className="text-green-500 w-5 h-5" />}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors cursor-pointer" onClick={() => setData({...data, insurance: {...data.insurance, life: !data.insurance.life}})}>
                <div className="flex items-center gap-3">
                  <Zap className={cn("w-6 h-6", data.insurance.life ? "text-blue-500" : "text-gray-300")} />
                  <div>
                    <p className="font-medium">Life Insurance (Term Plan)</p>
                    <p className="text-xs text-gray-400">Is your family protected?</p>
                  </div>
                </div>
                {data.insurance.life && <CheckCircle2 className="text-green-500 w-5 h-5" />}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-between items-center">
          <button 
            disabled={currentSubStep === 0}
            onClick={() => setCurrentSubStep(s => s - 1)}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-0 transition-opacity"
          >
            Back
          </button>
          <button 
            onClick={() => {
              if (currentSubStep < steps.length - 1) setCurrentSubStep(s => s + 1);
              else onComplete();
            }}
            disabled={loading}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (currentSubStep === steps.length - 1 ? "Get My Score" : "Continue")}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard({ userData, healthScore, onRunTool }: { 
  userData: UserFinancialData, 
  healthScore: MoneyHealthScore | null,
  onRunTool: (tool: 'fire' | 'tax' | 'health') => void
}) {
  const chartData = healthScore ? Object.entries(healthScore.dimensions).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    score: value
  })) : [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Financial Pulse</h1>
          <p className="text-gray-500">Based on your current profile and market trends.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Money Health Score</p>
          <div className="text-5xl font-black text-orange-500">{healthScore?.overall || 0}<span className="text-xl text-gray-300">/100</span></div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6">Wellness Dimensions</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9CA3AF'}} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{fill: '#F9FAFB'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#10B981' : entry.score > 40 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <ToolCard 
            title="FIRE Path Planner" 
            desc="Can you retire by 45? Let's find out." 
            icon={<TrendingUp className="text-orange-500" />} 
            onClick={() => onRunTool('fire')}
          />
          <ToolCard 
            title="Tax Wizard" 
            desc="Optimize deductions for FY 24-25." 
            icon={<Calculator className="text-blue-500" />} 
            onClick={() => onRunTool('tax')}
          />
          <ToolCard 
            title="Portfolio X-Ray" 
            desc="Analyze overlap and XIRR." 
            icon={<PieChart className="text-purple-500" />} 
            onClick={() => {}}
            disabled
          />
          <ToolCard 
            title="Couple's Planner" 
            desc="Joint goals and tax efficiency." 
            icon={<Users className="text-pink-500" />} 
            onClick={() => {}}
            disabled
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          AI Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthScore?.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-xs font-bold text-orange-500">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ToolView({ tool, response, loading, onBack }: { 
  tool: string | null, 
  response: string | null, 
  loading: boolean,
  onBack: () => void 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[500px]">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold capitalize">{tool?.replace('-', ' ')} Analysis</h2>
            <p className="text-gray-500 text-sm">Personalized AI-generated financial strategy.</p>
          </div>
          {loading && <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[300px] gap-4">
            <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-gray-400 animate-pulse">Consulting the AI Mentor...</p>
          </div>
        ) : (
          <div className="prose prose-orange max-w-none">
            <div className="markdown-body">
              <ReactMarkdown>
                {response || "No data available."}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function InputGroup({ label, value, onChange, type = "text" }: { label: string, value: any, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
      />
    </div>
  );
}

function ToolCard({ title, desc, icon, onClick, disabled }: { title: string, desc: string, icon: React.ReactNode, onClick: () => void, disabled?: boolean }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 text-left transition-all group",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      {!disabled && <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />}
    </button>
  );
}
