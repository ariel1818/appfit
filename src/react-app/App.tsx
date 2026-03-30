import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router";
import LanguageSelector from "@/react-app/components/LanguageSelector";
import AppModeToggle from "@/react-app/components/AppModeToggle";
import BottomNav from "@/react-app/components/BottomNav";
import SplashScreen from "@/react-app/components/SplashScreen";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/react-app/pages/Home"));
const ExerciseDetailPage = lazy(() => import("@/react-app/pages/ExerciseDetail"));
const WorkoutBuilderPage = lazy(() => import("@/react-app/pages/WorkoutBuilder"));
const WorkoutPreviewPage = lazy(() => import("@/react-app/pages/WorkoutPreview"));
const WorkoutPlanPage = lazy(() => import("@/react-app/pages/WorkoutPlan"));
const MyWorkoutsPage = lazy(() => import("@/react-app/pages/MyWorkouts"));
const MyLoadsPage = lazy(() => import("@/react-app/pages/MyLoads"));
const FormCheckPage = lazy(() => import("@/react-app/pages/FormCheck"));
const NutritionHomePage = lazy(() => import("@/react-app/pages/NutritionHome"));
const TMBCalculatorPage = lazy(() => import("@/react-app/pages/TMBCalculator"));
const FoodScannerPage = lazy(() => import("@/react-app/pages/FoodScanner"));
const DietGeneratorPage = lazy(() => import("@/react-app/pages/DietGenerator"));
const MyDietsPage = lazy(() => import("@/react-app/pages/MyDiets"));
const DietPlanPage = lazy(() => import("@/react-app/pages/DietPlan"));
const FoodCaloriesPage = lazy(() => import("@/react-app/pages/FoodCalories"));
const BioimpedanceTrackerPage = lazy(() => import("@/react-app/pages/BioimpedanceTracker"));
const WorkoutChatPage = lazy(() => import("@/react-app/pages/WorkoutChat"));
const NutritionChatPage = lazy(() => import("@/react-app/pages/NutritionChat"));
const DailyMealLogPage = lazy(() => import("@/react-app/pages/DailyMealLog"));
const ProgressPhotosPage = lazy(() => import("@/react-app/pages/ProgressPhotos"));
const PersonalRecordsPage = lazy(() => import("@/react-app/pages/PersonalRecords"));
const WorkoutCalendarPage = lazy(() => import("@/react-app/pages/WorkoutCalendar"));
const NutritionDashboardPage = lazy(() => import("@/react-app/pages/NutritionDashboard"));
const PhotoComparisonPage = lazy(() => import("@/react-app/pages/PhotoComparison"));
const ProfilePage = lazy(() => import("@/react-app/pages/Profile"));
const AchievementsPage = lazy(() => import("@/react-app/pages/Achievements"));
const OnboardingPage = lazy(() => import("@/react-app/pages/Onboarding"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const [appMode, setAppMode] = useState<'workout' | 'nutrition'>('workout');
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedMode = localStorage.getItem('appMode') as 'workout' | 'nutrition' | null;
    if (savedMode) {
      setAppMode(savedMode);
    }
    
    const onboardingStatus = localStorage.getItem('onboarding_completed');
    if (onboardingStatus === 'pending') {
      setShowOnboarding(true);
    }
  }, []);

  const handleModeChange = (mode: 'workout' | 'nutrition') => {
    setAppMode(mode);
    localStorage.setItem('appMode', mode);
    
    const isOnWorkoutRoute = location.pathname === '/' || 
                            location.pathname.startsWith('/exercise') ||
                            location.pathname.startsWith('/workout') ||
                            location.pathname.startsWith('/my-workouts');
    
    const isOnNutritionRoute = location.pathname.startsWith('/nutrition');
    
    if (mode === 'nutrition' && isOnWorkoutRoute) {
      navigate('/nutrition');
    } else if (mode === 'workout' && isOnNutritionRoute) {
      navigate('/');
    }
  };
  
  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowOnboarding(false);
  };
  
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  
  if (showOnboarding) {
    return (
      <Suspense fallback={<PageLoader />}>
        <OnboardingPage onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  return (
    <>
      <AppModeToggle mode={appMode} onChange={handleModeChange} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Workout Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/exercise/:id" element={<ExerciseDetailPage />} />
          <Route path="/workout-builder" element={<WorkoutBuilderPage />} />
          <Route path="/workout-preview" element={<WorkoutPreviewPage />} />
          <Route path="/workout-plan/:profileId" element={<WorkoutPlanPage />} />
          <Route path="/my-workouts" element={<MyWorkoutsPage />} />
          <Route path="/my-loads" element={<MyLoadsPage />} />
          <Route path="/form-check" element={<FormCheckPage />} />
          <Route path="/workout-chat" element={<WorkoutChatPage />} />
          <Route path="/personal-records" element={<PersonalRecordsPage />} />
          <Route path="/workout-calendar" element={<WorkoutCalendarPage />} />
          
          {/* Nutrition Routes */}
          <Route path="/nutrition" element={<NutritionHomePage />} />
          <Route path="/nutrition/calculator" element={<TMBCalculatorPage />} />
          <Route path="/nutrition/food-scanner" element={<FoodScannerPage />} />
          <Route path="/nutrition/diet-generator" element={<DietGeneratorPage />} />
          <Route path="/nutrition/my-diets" element={<MyDietsPage />} />
          <Route path="/nutrition/diet/:id" element={<DietPlanPage />} />
          <Route path="/nutrition/food-calories" element={<FoodCaloriesPage />} />
          <Route path="/nutrition/bioimpedance" element={<BioimpedanceTrackerPage />} />
          <Route path="/nutrition/chat" element={<NutritionChatPage />} />
          <Route path="/nutrition/daily-log" element={<DailyMealLogPage />} />
          <Route path="/nutrition/progress-photos" element={<ProgressPhotosPage />} />
          <Route path="/nutrition/dashboard" element={<NutritionDashboardPage />} />
          <Route path="/nutrition/photo-comparison" element={<PhotoComparisonPage />} />
          
          {/* Profile & Achievements */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Routes>
      </Suspense>
      <BottomNav />
    </>
  );
}

export default function App() {
  const [language, setLanguage] = useState<string | null>(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
  };

  if (!language) {
    return <LanguageSelector onSelect={handleLanguageSelect} />;
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
}
