import { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Sparkles, Play, Award, Users, BookOpen, 
  Video, Heart, Briefcase, Infinity, CheckCircle, 
  Star, ArrowRight, Mail, Phone, MapPin, Instagram,
  Send, ChevronDown, Zap, Target, TrendingUp, Crown
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// ============================================
// 🌟 NAVBAR COMPONENT
// ============================================
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'О курсе', href: '#about' },
    { name: 'Программа', href: '#modules' },
    { name: 'Преимущества', href: '#features' },
    { name: 'Отзывы', href: '#testimonials' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'glass py-3 shadow-lg' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 
                          flex items-center justify-center shadow-lg group-hover:shadow-pink-500/30 transition-all duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-gray-900">Lobacheva</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">Academy</div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-500 
                         rounded-full hover:bg-pink-50 transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
            
            {/* Hidden Contacts Toggle */}
            <button
              onClick={() => setShowContacts(!showContacts)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-500 
                       rounded-full hover:bg-pink-50 transition-all duration-300 flex items-center gap-1"
            >
              Контакты
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showContacts ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-gray-600 hover:text-pink-500">
                  Войти
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-bold text-gradient">Вход в аккаунт</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input placeholder="Email" type="email" />
                  <Input placeholder="Пароль" type="password" />
                  <Button className="w-full btn-primary">Войти</Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <a href="#contact" className="btn-primary text-sm">
              Начать обучение
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Contacts Dropdown */}
        {showContacts && (
          <div className="hidden lg:block absolute top-full left-1/2 -translate-x-1/2 mt-2">
            <div className="glass rounded-2xl p-4 shadow-xl animate-slide-up">
              <div className="flex items-center gap-6 text-sm">
                <a href="mailto:info@lobacheva.ru" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors">
                  <Mail className="w-4 h-4" />
                  info@lobacheva.ru
                </a>
                <a href="tel:+79991234567" className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors">
                  <Phone className="w-4 h-4" />
                  +7 (999) 123-45-67
                </a>
                <span className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  Москва
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 glass shadow-xl animate-slide-up">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-pink-500 hover:bg-pink-50 
                         rounded-xl transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <a href="mailto:info@lobacheva.ru" className="flex items-center gap-3 px-4 py-2 text-gray-600">
                <Mail className="w-5 h-5" />
                info@lobacheva.ru
              </a>
              <a href="tel:+79991234567" className="flex items-center gap-3 px-4 py-2 text-gray-600">
                <Phone className="w-5 h-5" />
                +7 (999) 123-45-67
              </a>
              <a href="#contact" className="btn-primary w-full text-center block">
                Начать обучение
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ============================================
// 🌟 HERO SECTION
// ============================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-50" />
      
      {/* Floating Blobs */}
      <div className="blob blob-pink w-96 h-96 -top-20 -right-20 animate-float" />
      <div className="blob blob-green w-80 h-80 bottom-20 -left-20 animate-float" style={{ animationDelay: '2s' }} />
      <div className="blob blob-yellow w-64 h-64 top-1/2 right-1/4 animate-float" style={{ animationDelay: '4s' }} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30"
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0)`,
             backgroundSize: '40px 40px'
           }} />

      {/* Sparkles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="sparkle" style={{
          top: `${20 + i * 15}%`,
          left: `${10 + i * 15}%`,
          animationDelay: `${i * 0.3}s`
        }} />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-md">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Курс 2026 — Набор открыт</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Станьте{' '}
              <span className="text-gradient">профессиональным</span>{' '}
              инструктором ногтевой индустрии
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-xl">
              Полная подготовка от основ педагогики до открытия собственной школы. 
              Обучение от ведущих экспертов отрасли.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="btn-primary flex items-center gap-2">
                <Play className="w-5 h-5" />
                Начать обучение
              </a>
              <a href="#modules" className="btn-secondary">
                Программа курса
              </a>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4 pt-4">
              {[
                { icon: BookOpen, text: '10 модулей' },
                { icon: Award, text: 'Сертификат' },
                { icon: Users, text: 'Практика' },
                { icon: Infinity, text: 'Навсегда' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600">
                  <item.icon className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <div className="relative animate-float">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-3xl blur-3xl opacity-30 scale-110" />
              
              {/* Image Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/hero-bg.jpg" 
                  alt="Lobacheva Academy" 
                  className="w-full h-auto object-cover"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-xl animate-bounce-in">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-500">Выпускников</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 glass rounded-2xl p-4 shadow-xl animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">4.9</div>
                    <div className="text-sm text-gray-500">Рейтинг</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-gray-400" />
      </div>
    </section>
  );
}

// ============================================
// 🌟 STATS SECTION
// ============================================
function StatsSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const targetValues = [500, 10, 50, 98];
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          targetValues.forEach((target, index) => {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              setCounts(prev => {
                const newCounts = [...prev];
                newCounts[index] = Math.floor(current);
                return newCounts;
              });
            }, 30);
          });
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: counts[0], suffix: '+', label: 'Выпускников', icon: Users },
    { value: counts[1], suffix: '+', label: 'Лет опыта', icon: Award },
    { value: counts[2], suffix: '+', label: 'Модулей', icon: BookOpen },
    { value: counts[3], suffix: '%', label: 'Успешных', icon: TrendingUp },
  ];

  return (
    <section ref={statsRef} className="py-16 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-white to-violet-50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100 
                            mb-4 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-8 h-8 text-pink-500" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-gradient mb-2">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// 🌟 ABOUT SECTION
// ============================================
function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    'Методика преподавания',
    'Психология обучения',
    'Юридическое оформление',
    'Маркетинг и продвижение',
    'Практика на реальных учениках',
  ];

  return (
    <section id="about" ref={sectionRef} className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-pink-50/30 to-violet-50/30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 rounded-full bg-pink-100 text-pink-600 text-sm font-medium mb-4">
            О курсе
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Комплексная подготовка <span className="text-gradient">инструкторов</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Станьте востребованным специалистом в ногтевой индустрии с нашей комплексной программой обучения
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Card */}
          <div className={`card-glass p-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Станьте востребованным инструктором
            </h3>
            <p className="text-gray-600 mb-6">
              Наш курс разработан опытными педагогами и практиками ногтевой индустрии. 
              Вы получите не только теоретические знания, но и практические навыки 
              проведения занятий, работы с учениками и ведения собственного бизнеса.
            </p>
            
            <ul className="space-y-4">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 
                                flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructor Card */}
          <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-3xl blur-2xl opacity-20" />
              
              {/* Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/instructor.jpg" 
                  alt="Анна Лобачева" 
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Info Card */}
              <div className="absolute -bottom-6 left-6 right-6 glass rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 
                                flex items-center justify-center text-white text-2xl font-bold">
                    АЛ
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Анна Лобачева</h4>
                    <p className="text-gray-500">Автор курса</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-sm font-medium">
                    10+ лет опыта
                  </span>
                  <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-sm font-medium">
                    500+ выпускников
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// 🌟 MODULES SECTION
// ============================================
function ModulesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const modules = [
    { num: '01', title: 'Основы педагогики', desc: 'Принципы обучения взрослых, методики преподавания, структура урока', icon: BookOpen, color: 'from-pink-400 to-rose-500' },
    { num: '02', title: 'Психология обучения', desc: 'Типы учеников, мотивация, работа с трудными ситуациями', icon: Heart, color: 'from-violet-400 to-purple-500' },
    { num: '03', title: 'Разработка программ', desc: 'Создание учебных планов, методических материалов, презентаций', icon: Target, color: 'from-blue-400 to-cyan-500' },
    { num: '04', title: 'Практические навыки', desc: 'Демонстрация техник, коррекция ошибок, индивидуальный подход', icon: Zap, color: 'from-green-400 to-emerald-500' },
    { num: '05', title: 'Юридические основы', desc: 'Оформление договоров, лицензирование, налоговые вопросы', icon: Award, color: 'from-yellow-400 to-orange-500' },
    { num: '06', title: 'Маркетинг школы', desc: 'Продвижение курсов, работа с соцсетями, привлечение клиентов', icon: TrendingUp, color: 'from-red-400 to-pink-500' },
    { num: '07', title: 'Контент создание', desc: 'Съемка видеоуроков, фото материалов, монтаж', icon: Video, color: 'from-indigo-400 to-blue-500' },
    { num: '08', title: 'Сертификация', desc: 'Подготовка к экзаменам, выдача документов, аккредитация', icon: Crown, color: 'from-amber-400 to-yellow-500' },
    { num: '09', title: 'Открытие школы', desc: 'Бизнес-план, помещение, оборудование, первые шаги', icon: Briefcase, color: 'from-teal-400 to-green-500' },
  ];

  return (
    <section id="modules" ref={sectionRef} className="section-padding relative overflow-hidden bg-gray-50">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-50 via-white to-violet-50" />
        <div className="blob blob-pink w-80 h-80 top-20 -right-20 opacity-30" />
        <div className="blob blob-green w-64 h-64 bottom-20 -left-10 opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-600 text-sm font-medium mb-4">
            Программа
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-gradient">10 модулей</span> курса
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Полный курс подготовки профессионального инструктора ногтевой индустрии
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, i) => (
            <div
              key={i}
              className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl 
                         transition-all duration-500 hover:-translate-y-2
                         ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Number */}
              <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100 group-hover:text-pink-100 transition-colors">
                {module.num}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${module.color} 
                            flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <module.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">{module.title}</h3>
              <p className="text-gray-500 text-sm relative z-10">{module.desc}</p>

              {/* Hover Border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${module.color} opacity-0 
                            group-hover:opacity-10 transition-opacity`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// 🌟 FEATURES SECTION
// ============================================
function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    { 
      icon: Video, 
      title: 'Видеоуроки высокого качества', 
      desc: 'Профессиональная съёмка каждого этапа работы с детальными пояснениями от экспертов',
      color: 'from-pink-400 to-rose-500'
    },
    { 
      icon: Users, 
      title: 'Персональный куратор', 
      desc: 'Индивидуальная поддержка на протяжении всего курса обучения от опытных наставников',
      color: 'from-violet-400 to-purple-500'
    },
    { 
      icon: Infinity, 
      title: 'Пожизненный доступ', 
      desc: 'Доступ к материалам курса навсегда после завершения обучения без ограничений',
      color: 'from-blue-400 to-cyan-500'
    },
    { 
      icon: Award, 
      title: 'Сертификат', 
      desc: 'Официальный документ о повышении квалификации установленного образца',
      color: 'from-green-400 to-emerald-500'
    },
    { 
      icon: Heart, 
      title: 'Практика', 
      desc: 'Отработка навыков на реальных моделях под руководством преподавателей',
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      icon: Briefcase, 
      title: 'Помощь в карьере', 
      desc: 'Содействие в поиске работы или открытии собственного бизнеса',
      color: 'from-red-400 to-pink-500'
    },
  ];

  return (
    <section id="features" ref={sectionRef} className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-violet-50/30 to-pink-50/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-600 text-sm font-medium mb-4">
            Преимущества
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Почему выбирают <span className="text-gradient">нас</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы создали идеальные условия для вашего обучения и профессионального роста
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl 
                         transition-all duration-500 hover:-translate-y-2
                         ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} 
                            flex items-center justify-center mb-6 group-hover:scale-110 transition-transform
                            shadow-lg group-hover:shadow-xl`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>

              {/* Arrow */}
              <div className="mt-6 flex items-center text-pink-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm">Подробнее</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// 🌟 TESTIMONIALS SECTION
// ============================================
function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      name: 'Елена Козлова',
      role: 'Выпускница курса',
      text: 'Благодаря курсу я открыла свою школу маникюра. Материал подан очень доступно, а поддержка куратора была бесценной!',
      rating: 5,
    },
    {
      name: 'Марина Соколова',
      role: 'Инструктор',
      text: 'Прошла курс год назад и уже обучила более 50 учениц. Курс даёт все необходимые знания для успешной карьеры.',
      rating: 5,
    },
    {
      name: 'Анна Петрова',
      role: 'Владелица студии',
      text: 'Лучшая инвестиция в себя! Теперь я не только мастер, но и успешный инструктор с постоянным потоком учеников.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" ref={sectionRef} className="section-padding relative overflow-hidden bg-gray-900">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20" />
      <div className="blob blob-pink w-96 h-96 -top-48 -right-48 opacity-20" />
      <div className="blob blob-green w-80 h-80 -bottom-40 -left-40 opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-pink-300 text-sm font-medium mb-4">
            Отзывы
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Что говорят <span className="text-gradient">выпускники</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className={`glass-dark rounded-2xl p-8 transition-all duration-500 hover:-translate-y-2
                         ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 
                              flex items-center justify-center text-white font-bold">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// 🌟 CONTACT SECTION
// ============================================
function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
    }, 1500);
  };

  return (
    <section id="contact" ref={sectionRef} className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-violet-50" />
      <div className="blob blob-pink w-96 h-96 -bottom-48 -right-48 opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <span className="inline-block px-4 py-2 rounded-full bg-pink-100 text-pink-600 text-sm font-medium mb-4">
              Начните сейчас
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Готовы стать <span className="text-gradient">инструктором</span>?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Оставьте заявку и получите бесплатную консультацию от наших специалистов. 
              Мы ответим на все ваши вопросы и поможем с выбором программы.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              {[
                'Бесплатная консультация',
                'Индивидуальный подбор программы',
                'Специальные условия при ранней записи',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            {/* Certificate Preview */}
            <div className="mt-8 relative">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img src="/certificate.jpg" alt="Сертификат" className="w-full h-auto" />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="card-glass p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Оставить заявку</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ваше имя</label>
                  <Input 
                    placeholder="Введите имя" 
                    className="h-12 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input 
                    type="email"
                    placeholder="email@example.com" 
                    className="h-12 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  <Input 
                    type="tel"
                    placeholder="+7 (999) 123-45-67" 
                    className="h-12 rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Сообщение</label>
                  <Textarea 
                    placeholder="Расскажите о вашем опыте и целях" 
                    className="min-h-[120px] rounded-xl border-gray-200 focus:border-pink-500 focus:ring-pink-500 resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 btn-primary text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Отправка...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Отправить заявку
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// 🌟 FOOTER
// ============================================
function Footer() {
  const [showContacts, setShowContacts] = useState(false);

  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/10 to-pink-900/10" />

      <div className="relative z-10">
        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-xl">Lobacheva Academy</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Инструкторский курс</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Профессиональная подготовка инструкторов ногтевой индустрии. 
                Современные методики обучения от лучших экспертов.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {[
                  { icon: Instagram, href: '#' },
                  { icon: Send, href: '#' },
                  { icon: Video, href: '#' },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center
                             hover:bg-pink-500 transition-colors duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-lg mb-6">Навигация</h4>
              <ul className="space-y-3">
                {['О курсе', 'Программа', 'Преимущества', 'Отзывы'].map((item) => (
                  <li key={item}>
                    <a 
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      className="text-gray-400 hover:text-pink-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacts Toggle */}
            <div>
              <button
                onClick={() => setShowContacts(!showContacts)}
                className="flex items-center gap-2 font-semibold text-lg mb-6 hover:text-pink-400 transition-colors"
              >
                Контакты
                <ChevronDown className={`w-5 h-5 transition-transform ${showContacts ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`space-y-4 transition-all duration-300 ${showContacts ? 'opacity-100' : 'opacity-50'}`}>
                <a href="mailto:info@lobacheva.ru" className="flex items-center gap-3 text-gray-400 hover:text-pink-400 transition-colors">
                  <Mail className="w-5 h-5" />
                  info@lobacheva.ru
                </a>
                <a href="tel:+79991234567" className="flex items-center gap-3 text-gray-400 hover:text-pink-400 transition-colors">
                  <Phone className="w-5 h-5" />
                  +7 (999) 123-45-67
                </a>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-5 h-5" />
                  Москва, Россия
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2026 Lobacheva Academy. Все права защищены.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-500 hover:text-pink-400 transition-colors">Политика конфиденциальности</a>
                <a href="#" className="text-gray-500 hover:text-pink-400 transition-colors">Условия использования</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// 🌟 MAIN APP
// ============================================
function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <ModulesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;
