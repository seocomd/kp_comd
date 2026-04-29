import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Settings, 
  FileText, 
  Download, 
  Printer, 
  Zap, 
  Activity, 
  Gauge, 
  Droplets, 
  Wind, 
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Save,
  Share2,
  Eye,
  Calendar,
  History,
  Plus,
  ArrowLeft,
  LogOut,
  LogIn,
  Layers,
  Image as ImageIcon,
  Copy,
  Info,
  Trash2,
  MapPin,
  ShieldCheck,
  Globe,
  Maximize,
  Minus,
  ChevronUp,
  ChevronDown,
  Edit,
  Users,
  Star
} from 'lucide-react';
import { specsData, Manufacturer, ModelSpec } from './data/specs';
import { STATION_IMAGES } from './data/modelImages';
import { cn } from './lib/utils';
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
import html2pdf from 'html2pdf.js';
import { AboutCompany } from './components/AboutCompany';
import { Comparison } from './components/Comparison';
import { InteractiveContainer } from './components/InteractiveContainer';

// --- Types ---
interface Block {
  id: string;
  type: 'header' | 'client-info' | 'manager' | 'message' | 'specs' | 'comparison' | 'costs' | 'control-panel' | 'about' | 'purpose' | 'contacts' | 'footer' | 'interactive-container';
  isVisible: boolean;
  config?: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl: string;
  role?: 'admin' | 'manager';
  password?: string;
  proposalCount?: number;
  totalViews?: number;
}
interface ManagerInfo {
  id?: string;
  name: string;
  phone: string;
  email: string;
  photoUrl: string;
  role?: 'admin' | 'manager';
  password?: string;
  proposalCount?: number;
  totalViews?: number;
}

interface ProposalItem {
  manufacturerId: string;
  modelName: string;
  variant: string;
  price?: number;
  recommended?: boolean;
}

interface ProposalData {
  id?: string;
  clientName: string;
  managerId: string;
  items: ProposalItem[];
  blocks: Block[]; // New block-based structure
  fuelPrice: number;
  toRate: number;
  showCompanyInfo: boolean;
  usePurpose: boolean;
  useControlPanel: boolean;
  purposeType: string;
  createdAt: any;
  viewCount: number;
  lastViewedAt: any;
  firstViewedAt: any;
}

// --- Components ---

// --- Constants ---

const PURPOSES = {
  agro: {
    label: 'Агропромышленный комплекс',
    text: `Производственная Компания Дизель предлагает предприятиям агропромышленного комплекса приобрести дизельные агрегаты, генераторы и дизельные электростанции (АД, ДГУ, ДЭС) для обеспечения должного уровня энергобезопасности на объектах различного назначения. Все аграрные предприятия от небольших фермерских хозяйств до масштабных комбинатов в равной степени нуждаются в защите от аварийных, приводящих к убыткам инцидентов, связанных с перебоями в подаче электроэнергии.
Дизельные электростанции и другие типы резервного электрооборудования для агропромышленного комплекса.

Предприятия аграрного сектора зачастую находятся вдали от надежных централизованных источников электропитания – в этом состоит их производственная специфика.

Для многих населенных пунктов в сельской местности мелкие аварии в электроснабжении – повседневное явление. Разумеется, в таких районах можно и даже необходимо развивать аграрный сектор, обезопасив производство от энергетических форсмажоров. Для этих целей «Компания Дизель» выпускает серийное электрооборудование и разрабатывает модели с индивидуальными техническими характеристиками, если заказчик в таковых нуждается.`
  },
  zhkh: {
    label: 'Жилищно-коммунального хозяйства (ЖКХ)',
    text: `Производственная «Компания Дизель» предлагает предприятиям ЖКХ приобрести дизельные агрегаты, электростанции и дизель-генераторы (ДЭС, АД, ДГУ) для проведения работ с использованием автономных источников энергии. Уборка улиц, благоустройство придомовых территорий, ремонтные работы и другие мероприятия, типичные для жилищно-коммунального хозяйства, зачастую проводятся вдали от централизованных источников электроэнергии.
«Компания Дизель» – надежные дизельные электростанции для нужд ЖКХ.

Оборудование со стандартными характеристиками выпускается в рамках серийного производства. Возможен выпуск электрооборудования с индивидуальными параметрами мощности и функциональности по проектам заказчика.

От дизель-генератора могут получать электроэнергию осветительные приборы, используемые во время уборки или благоустройства улиц. Электроэнергия для бытовок и работы ремонтного оборудования также может подаваться от дизельного генератора. Чем надежнее энергоснабжение и энергобезопасность на каждом отдельно взятом объекте ЖКХ, тем более комфортной будет жизнь в городе или населенном пункте.`
  },
  industry: {
    label: 'Промышленность',
    text: `Большинство, если не все без какого-либо исключения промышленные предприятия в России электрифицированы – от централизованной электрической сети работают станки и компьютеры, отопительные установки, лифты, не говоря уже об освещении, сигнализации и бытовых приборах. В такой ситуации перебои или полное отключение электричества становятся техногенной катастрофой для отдельного предприятия или бизнеса.
ДГУ - дизельные генераторы и экономичные электростанции для промышленных производств.

За 10 лет продуктивной и эффективной как производственной, так и коммерческой деятельности «Компания Дизель» наладила выпуск множества моделей электрооборудования, позволяющего сформировать на заводе полноценную систему резервного энергоснабжения. Продукция бренда «Компания Дизель» освоила отечественный рынок и нашла потребителей за рубежом.

На официальном сайте производителя вниманию потенциальных заказчиков представлен полный подробный каталог серийного производства. Кроме того, команда инженеров Компании Дизель принимает заказы на разработку оборудования с индивидуальными техническими характеристиками.

Пятиэтапная система контроля качества продукции позволяет предприятию гарантировать потребителю длительную бесперебойную эксплуатацию всех предлагаемых типов электрооборудования.`
  },
  construction: {
    label: 'Строительство',
    text: `Современная строительная площадка как производственный объект практически полностью зависит от электроэнергии. Производственная «Компания Дизель» предлагает застройщикам приобрести дизель-генераторы, дизельные электростанции и агрегаты (ДГУ, ДЭС, АД), чтобы создать полноценную систему энергобезопасности для строительства объектов различных масштабов.

От электроэнергии работают строительные краны, подъемники, бурильные установки, осветительное оборудование. Таким образом, перебои в подаче электричества на стройплощадку или полное приостановление энергоснабжения влечёт за собой срывы сроков, отражается на качестве строительства, в общем, приводит к прямым убыткам.
Дизельная электростанция для бесперебойного качественного строительства.

Производственная «Компания Дизель» - авторитетный производитель промышленного электрооборудования, известный на профильном рынке России, выпускает целый ряд моделей автономных источников электропитания для строительных площадок.

С техническими характеристиками серийных моделей можно ознакомиться немедленно в официальном электронном каталоге продукции. Для строительных площадок с индивидуальными параметрами энергопотребления наши специалисты готовы разработать оборудование эксклюзивно.

Российский потребитель во многом привык ориентироваться на зарубежные бренды и торговые марки. «Компания Дизель», успешно участвуя в программе импортозамещения, оправдывает доверие заказчиков и клиентов на внутреннем рынке. В процессе производства каждая единица предлагаемой продукции проходит пять этапов контроля качества.`
  },
  energy: {
    label: 'Энергетика',
    text: `Объекты энергетики, как и другие промышленные объекты, нуждаются в обеспечении энергетической безопасности. Отечественная производственная «Компания Дизель» выпускает и реализует на внутреннем и достаточно обширном внешнем рынке дизельные генераторы, электростанции и агрегаты (ДГУ, ДЭС, АД), предназначенные для обеспечения бесперебойной автономной работы объектов энергетики в аварийном или плановом режиме.

Турбины и другие специальные установки, перерабатывающие механическую энергию в электроток, работают также от электроэнергии. В комплекс объекта энергетики входят административные здания и хозяйственные помещения.
Дизельная электростанция для энергетики – все, что необходимо для бесперебойной эксплуатации объекта.

В форс-мажорной ситуации объект энергетики должен продолжить производственный цикл в автономном режиме. Для обеспечения бесперебойного длительного автономного функционирования объекты энергетики нуждаются в мощном резервном дизельном электрооборудовании.

Модельный ряд продукции Компании Дизель включает несколько десятков дизель- генераторов, предназначенных для длительного интенсивного использования на объектах энергетики. Подробные технические характеристики всех моделей оборудования, выпускаемых серийно, представлены в официальном электронном каталоге продукции.

Помимо серийного выпуска оборудования «Компания Дизель» занимается разработкой и изготовлением электростанций специального назначения.`
  }
};

const VARIANT_DESCRIPTIONS = {
  open: {
    title: 'ДЭС на раме (открытая)',
    items: [
      'Минимальные габариты и вес',
      'Низкая стоимость по сравнению с вариантными решениями',
      'Удобство обслуживания за счет свободного доступа ко всем узлам ДЭС',
      'Требуется наличие специально подготовленного помещения (вентиляция, выхлоп, обогрев)',
      'Подходит для установки внутри зданий или существующих контейнеров',
      'Экономия на вводе в эксплуатацию при готовой инфраструктуре'
    ]
  },
  enclosure: {
    title: 'ДЭС в погодозащитном кожухе',
    items: [
      'Защита ДЭС от осадков и неблагоприятных погодных условий',
      'Экономия на вводе в эксплуатацию, не требует монтажа, достаточно ровной твердой площадки',
      'Средний уровень защиты ДЭС от осадков',
      'Базовая защита от несанкционированного доступа',
      'Запираемые эргономичные дверцы, обеспечивающие доступ ко всем основным узлам ДЭС для их осмотра и сервисного обслуживания',
      'Уровень демпфирования шума ДЭС – 12-15 дБ(А)',
      'Стойкая антикоррозийная покраска кожуха',
      'Срок эксплуатации кожуха – не менее 10 лет'
    ]
  },
  container: {
    title: 'ДЭС в контейнере',
    items: [
      'Жесткая, долговечная, эргономичная конструкция собственной разработки Компании Дизель, уникальная технология производства',
      'Надежный запуск и работа ДЭС до - 50°С',
      'Максимальная защита ДЭС от осадков',
      'Высокий комфорт при эксплуатации ДЭС, проведение ТО и ремонта в любую погоду',
      'Уровень демпфирования шума ДЭС - до 40 дБ(А)',
      'Средний уровень антивандальный защиты',
      'Высокая степень огнестойкости, защита от коррозии',
      'Полная автоматизация работы ДЭС, максимальные возможности по расширению функционала ДЭС',
      'Экономия на вводе ДЭС в эксплуатацию, не требует монтажа, простое многократное перемещение',
      'Срок эксплуатации контейнера – не менее 15 лет'
    ]
  },
  sever: {
    title: 'ДЭС в низкотемпературном блок-контейнере «Север-М»',
    items: [
      'Жесткая, долговечная, эргономичная конструкция на базе морского 20 / 40-футового ISO-контейнера',
      'Повышенная антивандальная защита',
      'Надежный запуск и работа ДЭС до - 50°С',
      'Максимальная защита ДЭС от осадков',
      'Высокий комфорт при эксплуатации ДЭС, проведение ТО и ремонта в любую погоду',
      'Уровень демпфирования шума ДЭС - до 40 дБ(А)',
      'Высокая степень огнестойкости, защита от коррозии',
      'Полная автоматизация работы ДЭС, максимальные возможности по расширению функционала ДЭС',
      'Стандартизированные ISO-крепления для погрузки',
      'Экономия на вводе ДЭС в эксплуатацию, не требует монтажа, простое многократное перемещение',
      'Срок эксплуатации контейнера – не менее 20 лет'
    ]
  },
  mobile: {
    title: 'Передвижная дизельная электростанция (ПЭС)',
    items: [
      'Максимальная мобильность и готовность к работе',
      'Идеальный вариант, если планируется частое перемещение ДЭС (обслуживание и ремонт удаленных инфраструктурных объектов, ремонтные бригады, службы МЧС и пр.).',
      'Экономия на вводе в эксплуатацию',
      'Тип устанавливаемого оборудования: дизельная электростанция в контейнере или кожухе',
      'ДЭС на шасси автомобильного прицепа - для перемещения по дорогам общего пользования, в том числе по дорогам без покрытия, максимальная скорость 90 км/ч (регистрация в ГИБДД, выдается паспорт транспортного средства – ПТС)',
      'ДЭС на шасси тракторного прицепа - для перемещения по дорогам общего пользования, по бездорожью, сильнопересечённой местности, макс. скорость 35 км/ч (регистрация в Гостехнадзоре - паспорт самоходной машины – ПСМ)',
      'ДЭС на салазках (съемные / стационарные) - для перемещения волоком по бездорожью (регистрация в гос. органах не требуется)',
      'ДЭС на шасси грузового автомобиля - для перемещения по дорогам общего пользования, в том числе по дорогам без покрытия.'
    ]
  }
};

const STANDARD_EQUIPMENT = [
  'Двигатель с навесным оборудованием',
  'Силовой синхронный генератор',
  'Базовая рама',
  'Система впуска воздуха с воздушным фильтром',
  'Система газовыхлопа с глушителем',
  'Система топливоподачи с встроенным топливным баком',
  'Система охлаждения с радиатором',
  'Система управления ДЭС с контроллером',
  'Электрооборудование с АКБ и зарядным устройством',
  'Предотгрузочное тестирование',
  'Машинное масло и антифриз',
  'Полный комплект документации'
];

const Header = () => (
  <div className="relative w-full h-[180px] overflow-hidden mb-8 print:mb-4 group-container page-break-avoid">
    <img 
      src="/input_file_2.png" 
      alt="Дизель Компания" 
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
    />
    {/* Optional overlay for print quality if needed, but the image is high quality */}
    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,41,107,0.1)] to-transparent pointer-events-none" />
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'editor' | 'proposal'>('dashboard');
  const [currentProposalId, setCurrentProposalId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedSpecs, setLoadedSpecs] = useState<Manufacturer[]>(specsData);

  // Manager state
  const [manager, setManager] = useState<ManagerInfo>(() => {
    const saved = localStorage.getItem('diesel_manager');
    return saved ? JSON.parse(saved) : { name: '', phone: '', email: '', photoUrl: '' };
  });

  // Editor state
  const [clientName, setClientName] = useState('');
  const [isTwoStations, setIsTwoStations] = useState(false);
  const [isThreeStations, setIsThreeStations] = useState(false);
  const [showCompanyInfo, setShowCompanyInfo] = useState(true);
  
  const [station1, setStation1] = useState<ProposalItem>({
    manufacturerId: 'yuchai',
    modelName: 'на загрузке...',
    variant: 'open',
    price: 0,
    recommended: false
  });

  const [station2, setStation2] = useState<ProposalItem>({
    manufacturerId: 'yuchai',
    modelName: 'на загрузке...',
    variant: 'open',
    price: 0,
    recommended: false
  });

  const [station3, setStation3] = useState<ProposalItem>({
    manufacturerId: 'yuchai',
    modelName: 'на загрузке...',
    variant: 'open',
    price: 0,
    recommended: false
  });

  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'b1', type: 'header', isVisible: true },
    { id: 'b2', type: 'contacts', isVisible: true },
    { id: 'b3', type: 'client-info', isVisible: true },
    { id: 'b4', type: 'message', isVisible: true },
    { id: 'b5', type: 'purpose', isVisible: false },
    { id: 'b6', type: 'specs', isVisible: true },
    { id: 'b7', type: 'comparison', isVisible: true },
    { id: 'b8', type: 'costs', isVisible: true },
    { id: 'b9', type: 'control-panel', isVisible: true },
    { id: 'b12', type: 'interactive-container', isVisible: true },
    { id: 'b10', type: 'about', isVisible: true },
    { id: 'b11', type: 'footer', isVisible: true },
  ]);

  const [fuelPrice, setFuelPrice] = useState<number>(74.94);
  const [toRate, setToRate] = useState<number>(150);
  const [usePurpose, setUsePurpose] = useState(false);
  const [useControlPanel, setUseControlPanel] = useState(true);
  const [purposeType, setPurposeType] = useState<keyof typeof PURPOSES>('agro');

  // --- SQLite API Sync ---

  useEffect(() => {
    if (loadedSpecs.length > 0 && station1.modelName === 'на загрузке...') {
      const firstMan = loadedSpecs[0];
      if (firstMan.models.length > 0) {
        const firstModel = firstMan.models[0];
        setStation1(prev => ({ ...prev, manufacturerId: firstMan.id, modelName: firstModel.name }));
        setStation2(prev => ({ ...prev, manufacturerId: firstMan.id, modelName: firstModel.name }));
        setStation3(prev => ({ ...prev, manufacturerId: firstMan.id, modelName: firstModel.name }));
      }
    }
  }, [loadedSpecs]);

  useEffect(() => {
    const init = async () => {
      // Restore user session if exists
      const savedUser = localStorage.getItem('proposal_user');
      if (savedUser) {
        const u = JSON.parse(savedUser) as User;
        setUser(u);
        loadProposals(u.id, u.role);
        
        // Refresh manager profile
        const resp = await fetch(`/api/managers/${u.id}`);
        if (resp.ok) {
          setManager(await resp.json());
        }
      }

      // Fetch dynamic specs
      try {
        const sResp = await fetch('/api/specs');
        if (sResp.ok) {
          const sData = await sResp.json();
          if (Array.isArray(sData) && sData.length > 0) {
            // Apply images from mapping
            const enriched = sData.map((man: Manufacturer) => ({
              ...man,
              models: man.models.map((model: ModelSpec) => ({
                ...model,
                imageUrl: STATION_IMAGES[model.name] || 
                          STATION_IMAGES[`Дизельный генератор ${model.name}`] || 
                          STATION_IMAGES[`Дизельная электростанция ${model.name}`] ||
                          model.imageUrl
              }))
            }));
            setLoadedSpecs(enriched);
          }
        }
      } catch (err) {
        console.error('Specs load error:', err);
      }

      // Check for proposal ID in URL
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('id');
      if (pid) {
        loadProposal(pid);
      } else {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadProposals = async (uid: string, role?: string) => {
    try {
      const url = role === 'admin' ? '/api/proposals' : `/api/proposals?managerId=${uid}`;
      const resp = await fetch(url);
      if (resp.ok) {
        setProposals(await resp.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProposal = async (id: string, targetView: 'proposal' | 'editor' = 'proposal') => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/proposals/${id}`);
      if (resp.ok) {
        const data = await resp.json() as ProposalData;
        setClientName(data.clientName);
        setFuelPrice(data.fuelPrice);
        setToRate(data.toRate);
        setShowCompanyInfo(data.showCompanyInfo);
        setStation1(data.items[0]);
        if (data.items.length === 2) {
          setIsTwoStations(true);
          setIsThreeStations(false);
          setStation2(data.items[1]);
        } else if (data.items.length === 3) {
          setIsTwoStations(false);
          setIsThreeStations(true);
          setStation2(data.items[1]);
          setStation3(data.items[2]);
        } else {
          setIsTwoStations(false);
          setIsThreeStations(false);
        }
        setUsePurpose(data.usePurpose || false);
        setUseControlPanel(data.useControlPanel || false);
        setPurposeType((data.purposeType as any) || 'agro');
        if (data.blocks && data.blocks.length > 0) {
          setBlocks(data.blocks);
        } else {
          // Initialize default blocks if missing
          setBlocks([
            { id: 'b1', type: 'header', isVisible: true },
            { id: 'b2', type: 'contacts', isVisible: true },
            { id: 'b3', type: 'client-info', isVisible: true },
            { id: 'b4', type: 'message', isVisible: true },
            { id: 'b5', type: 'purpose', isVisible: data.usePurpose || false },
            { id: 'b6', type: 'specs', isVisible: true },
            { id: 'b7', type: 'comparison', isVisible: true },
            { id: 'b8', type: 'costs', isVisible: true },
            { id: 'b9', type: 'control-panel', isVisible: data.useControlPanel || true },
            { id: 'b10', type: 'about', isVisible: data.showCompanyInfo || true },
            { id: 'b11', type: 'footer', isVisible: true },
          ]);
        }
        setCurrentProposalId(id);
        setView(targetView);

        // Fetch manager profile
        const mResp = await fetch(`/api/managers/${data.managerId}`);
        if (mResp.ok) {
          setManager(await mResp.json());
        }

        // Increment view count if public view
        if (targetView === 'proposal') {
          await fetch(`/api/proposals/${id}/view`, { method: 'POST' });
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSaveProposal = async () => {
    if (!user) return;
    if (!clientName.trim()) {
      alert('Пожалуйста, введите название клиента/компании. Это поле обязательно.');
      return;
    }
    const items = [station1];
    if (isTwoStations || isThreeStations) items.push(station2);
    if (isThreeStations) items.push(station3);

    const data = {
      clientName,
      managerId: user.id,
      items,
      blocks,
      fuelPrice,
      toRate,
      showCompanyInfo,
      usePurpose,
      useControlPanel,
      purposeType
    };

    try {
      if (currentProposalId) {
        await fetch(`/api/proposals/${currentProposalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        alert('КП успешно обновлено!');
      } else {
        const resp = await fetch('/api/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await resp.json();
        setCurrentProposalId(result.id);
        alert('КП успешно сохранено!');
      }
      loadProposals(user.id, user.role);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProposal = async (id: string) => {
    if (!user) return;
    if (!confirm('Вы уверены, что хотите удалить это предложение?')) return;
    
    try {
      await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
      loadProposals(user.id, user.role);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (email: string, password?: string) => {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (resp.ok) {
        const u = await resp.json();
        const userObj = { id: u.id, name: u.name, email: u.email, photoUrl: u.photoUrl, role: u.role };
        setUser(userObj);
        localStorage.setItem('proposal_user', JSON.stringify(userObj));
        setManager(u);
        loadProposals(u.id, u.role);
      } else {
        const err = await resp.json();
        alert(err.error || 'Ошибка входа');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('proposal_user');
    setProposals([]);
    setView('dashboard');
  };

  // Helper derivatives
  const getSpec = (item: ProposalItem) => {
    const man = loadedSpecs.find(m => m.id === item.manufacturerId) || loadedSpecs[0];
    if (!man) return { man: null, model: null };
    const model = (man.models || []).find((m: any) => m.name === item.modelName) || man.models?.[0];
    return { man, model };
  };

  const spec1 = getSpec(station1);
  const spec2 = getSpec(station2);
  const spec3 = getSpec(station3);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-gray">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-brand-blue">
          <Activity className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-gray overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <Dashboard 
            key="dashboard"
            proposals={proposals} 
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onCreate={() => { setView('editor'); setCurrentProposalId(null); setClientName(''); }}
            onView={(id: string) => loadProposal(id, 'proposal')}
            onEdit={(id: string) => loadProposal(id, 'editor')}
            onDelete={handleDeleteProposal}
          />
        )}
        
        {view === 'editor' && (
          <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full h-full">
            <AdminSidebar 
              user={user}
              clientName={clientName}
              setClientName={setClientName}
              isTwoStations={isTwoStations}
              setIsTwoStations={setIsTwoStations}
              isThreeStations={isThreeStations}
              setIsThreeStations={setIsThreeStations}
              showCompanyInfo={showCompanyInfo}
              setShowCompanyInfo={setShowCompanyInfo}
              useControlPanel={useControlPanel}
              setUseControlPanel={setUseControlPanel}
              station1={station1}
              setStation1={setStation1}
              station2={station2}
              setStation2={setStation2}
              station3={station3}
              setStation3={setStation3}
              fuelPrice={fuelPrice}
              setFuelPrice={setFuelPrice}
              toRate={toRate}
              setToRate={setToRate}
              usePurpose={usePurpose}
              setUsePurpose={setUsePurpose}
              purposeType={purposeType}
              setPurposeType={setPurposeType}
              manager={manager}
              setManager={setManager}
              onSave={handleSaveProposal}
              onBack={() => setView('dashboard')}
              currentProposalId={currentProposalId}
              blocks={blocks}
              setBlocks={setBlocks}
              loadedSpecs={loadedSpecs}
            />
            <PreviewArea 
              blocks={blocks}
              station1={spec1.model}
              station2={isTwoStations || isThreeStations ? spec2.model : null}
              station3={isThreeStations ? spec3.model : null}
              p1={station1.price || 0}
              p2={station2.price || 0}
              p3={station3.price || 0}
              rec1={station1.recommended}
              rec2={station2.recommended}
              rec3={station3.recommended}
              manager={manager}
              fuelPrice={fuelPrice}
              toRate={toRate}
              showCompanyInfo={showCompanyInfo}
              usePurpose={usePurpose}
              useControlPanel={useControlPanel}
              purposeType={purposeType}
              v1={station1.variant as any}
              v2={station2.variant as any}
              v3={station3.variant as any}
              onBack={() => setView('dashboard')}
              user={user}
              onUpdateBlocks={setBlocks}
            />
          </motion.div>
        )}

        {view === 'proposal' && (
          <PreviewArea 
            key="proposal"
            blocks={blocks}
            station1={spec1.model}
            station2={isTwoStations || isThreeStations ? spec2.model : null}
            station3={isThreeStations ? spec3.model : null}
            p1={station1.price || 0}
            p2={station2.price || 0}
            p3={station3.price || 0}
            rec1={station1.recommended}
            rec2={station2.recommended}
            rec3={station3.recommended}
            manager={manager}
            fuelPrice={fuelPrice}
            toRate={toRate}
            showCompanyInfo={showCompanyInfo}
            usePurpose={usePurpose}
            useControlPanel={useControlPanel}
            purposeType={purposeType}
            v1={station1.variant as any}
            v2={station2.variant as any}
            v3={station3.variant as any}
            onBack={() => setView('dashboard')}
            isClientView
            user={user}
            onUpdateBlocks={setBlocks}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Subcomponents ---

const Dashboard = ({ proposals, user, onLogin, onLogout, onCreate, onView, onEdit, onDelete }: any) => {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposals' | 'accounts'>('proposals');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      onLogin(emailInput, passwordInput);
      setShowInput(false);
      setPasswordInput('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="flex flex-col w-full h-full p-8 overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-blue">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-doc-slate-800 uppercase tracking-tighter">Панель управления КП</h1>
              <p className="text-sm text-doc-slate-500 font-medium italic">Компания Дизель — Генератор Коммерческих Предложений</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div 
                  key="user-badge"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-4 bg-white p-2 pl-4 rounded-xl shadow-sm border border-doc-slate-100 font-bold"
                >
                  <div className="text-right">
                    <p className="text-sm font-black text-doc-slate-800 leading-none">{user.name}</p>
                    <p className="text-[10px] text-doc-slate-400 font-bold uppercase">{user.email}</p>
                  </div>
                  <button onClick={onLogout} title="Выйти" className="p-2 text-doc-slate-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : showInput ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col items-end gap-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="email"
                      placeholder="Email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-white border border-doc-slate-200 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 w-48 shadow-sm"
                    />
                    <input
                      type="password"
                      placeholder="Пароль"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="bg-white border border-doc-slate-200 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/20 w-40 shadow-sm"
                    />
                    <button 
                      type="submit"
                      className="bg-brand-blue text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all uppercase"
                    >
                      OK
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowInput(false)}
                      className="text-doc-slate-400 hover:text-doc-slate-600 px-2 font-bold text-xs uppercase"
                    >
                      Отмена
                    </button>
                  </div>
                  <p className="text-[10px] text-doc-slate-400 font-bold uppercase tracking-tight">Регистрация возможна только администратором</p>
                </motion.form>
              ) : (
                <motion.button 
                  key="login-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setShowInput(true)}
                  className="flex items-center gap-2 bg-brand-blue text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all uppercase tracking-wider"
                >
                  <LogIn className="w-4 h-4" /> Войти как менеджер
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<FileText />} label="Всего КП" value={proposals.length} color="bg-blue-500" />
          <StatCard icon={<Eye />} label="Общий охват" value={proposals.reduce((acc: number, p: any) => acc + (p.viewCount || 0), 0)} color="bg-emerald-500" />
          <StatCard icon={<History />} label="Активные ссылки" value={proposals.filter((p: any) => p.viewCount > 0).length} color="bg-amber-500" />
        </div>

        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('proposals')}
              className={cn(
                "px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm",
                activeTab === 'proposals' ? "bg-brand-blue text-white" : "bg-white text-doc-slate-400 hover:bg-doc-slate-50"
              )}
            >
              Предложения
            </button>
            <button 
              onClick={() => setActiveTab('accounts')}
              className={cn(
                "px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm",
                activeTab === 'accounts' ? "bg-brand-blue text-white" : "bg-white text-doc-slate-400 hover:bg-doc-slate-50"
              )}
            >
              Управление пользователями
            </button>
          </div>
        )}

        {activeTab === 'proposals' ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-doc-slate-100">
            <div className="p-6 border-b border-doc-slate-50 flex justify-between items-center bg-doc-slate-50/50">
              <h2 className="text-sm font-black text-brand-blue uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Список предложений
              </h2>
              <button 
                onClick={onCreate}
                disabled={!user}
                className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:px-6 transition-all"
              >
                <Plus className="w-4 h-4" /> Создать новое КП
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-doc-slate-50 text-[11px] font-black uppercase text-doc-slate-400 tracking-wider">
                    <th className="p-5 pl-8">Клиент</th>
                    {user?.role === 'admin' && <th className="p-5">Менеджер</th>}
                    <th className="p-5">Конфигурация</th>
                    <th className="p-5">Дата создания</th>
                    <th className="p-5">Просмотры</th>
                    <th className="p-5 text-center">Последний просмотр</th>
                    <th className="p-5 pr-8 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p: any) => (
                    <tr key={p.id} className="group hover:bg-doc-blue-50/30 transition-colors border-b border-doc-slate-50">
                      <td className="p-5 pl-8">
                        <p className="font-black text-doc-slate-800 text-base italic">{p.clientName || 'Без названия'}</p>
                        <p className="text-[11px] text-doc-slate-400 font-bold flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" /> ID: {p.id}
                        </p>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="p-5">
                          <p className="text-xs font-black text-brand-blue uppercase tracking-tight">{p.managerName || '—'}</p>
                        </td>
                      )}
                      <td className="p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {p.items?.map((item: any, idx: number) => (
                            <span key={idx} className="bg-white border border-doc-slate-100 px-3 py-1 rounded text-[10px] font-black text-brand-blue uppercase tracking-tight">
                              {item.modelName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="text-[12px] font-bold text-doc-slate-600">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('ru-RU') : '—'}
                        </p>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3 text-bold">
                          <div className="h-2 w-14 bg-doc-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${Math.min((p.viewCount || 0) * 10, 100)}%` }} />
                          </div>
                          <span className="text-[12px] font-black text-emerald-600">{p.viewCount || 0}</span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <p className="text-[12px] font-black text-doc-slate-700">
                          {p.lastViewedAt ? new Date(p.lastViewedAt).toLocaleDateString('ru-RU') : '—'}
                        </p>
                      </td>
                      <td className="p-5 pr-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => onView(p.id)}
                            className="p-3 bg-accent-light text-brand-blue rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                            title="Просмотреть"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => onEdit && onEdit(p.id)}
                            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Редактировать"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => onDelete(p.id)}
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Удалить"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!user && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <Info className="w-8 h-8 text-doc-slate-300 mx-auto mb-4" />
                        <p className="text-doc-slate-400 font-bold uppercase tracking-widest text-sm">Войдите в систему для просмотра ваших предложений</p>
                      </td>
                    </tr>
                  )}
                  {user && proposals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-doc-slate-400 italic font-bold uppercase">У вас пока нет созданных предложений</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-doc-slate-100">
            <AccountsManagement currentUser={user} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-doc-slate-100 flex items-center gap-6">
    <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl text-white shadow-lg", color)}>
      {React.cloneElement(icon, { className: "w-7 h-7" })}
    </div>
    <div>
      <p className="text-[12px] font-bold text-doc-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-doc-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

const AdminSidebar = ({ 
  user, clientName, setClientName, isTwoStations, setIsTwoStations, 
  isThreeStations, setIsThreeStations,
  showCompanyInfo, setShowCompanyInfo, useControlPanel, setUseControlPanel,
  station1, setStation1, station2, setStation2, station3, setStation3,
  fuelPrice, setFuelPrice, toRate, setToRate, 
  usePurpose, setUsePurpose, purposeType, setPurposeType,
  manager, setManager, onSave, onBack, currentProposalId,
  blocks, setBlocks,
  loadedSpecs
}: any) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'blocks' | 'profile'>('settings');

  const updateProfile = async () => {
    try {
      const resp = await fetch(`/api/managers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manager)
      });
      if (resp.ok) alert('Профиль обновлен!');
    } catch (e) { alert('Ошибка обновления'); }
  };

  return (
    <aside className="w-[360px] bg-white border-r border-border-color p-0 flex flex-col h-full shadow-lg z-10 no-print">
      <div className="p-6 border-b border-doc-slate-50 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-doc-slate-50 rounded-lg text-doc-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue border-b-2 border-brand-blue pb-1">
          Конструктор КП
        </div>
        <div className="w-8" />
      </div>

      <div className="flex border-b border-doc-slate-50 bg-doc-slate-50">
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-4 h-4" />} label="КП" />
        <TabButton active={activeTab === 'blocks'} onClick={() => setActiveTab('blocks')} icon={<Layers className="w-4 h-4" />} label="Блоки" />
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User className="w-4 h-4" />} label="Профиль" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <motion.div 
              key="settings-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-doc-slate-500 uppercase">Клиент / Компания</label>
                  <input 
                    placeholder="ООО 'Газпром'"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="admin-input font-bold"
                  />
                </div>

                <div className="flex flex-col gap-2 p-3 bg-doc-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <Layers className="w-4 h-4 text-brand-blue" />
                      <span className="text-[11px] font-black text-brand-blue uppercase">Две станции</span>
                    </div>
                    <button 
                      onClick={() => {
                        const next = !isTwoStations;
                        setIsTwoStations(next);
                        if (next) setIsThreeStations(false);
                      }}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors",
                        isTwoStations ? 'bg-brand-blue' : 'bg-doc-slate-300'
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                        isTwoStations ? 'left-6' : 'left-1'
                      )} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-doc-slate-200 pt-2">
                    <div className="flex items-center gap-2 font-bold">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span className="text-[11px] font-black text-emerald-600 uppercase">Три станции</span>
                    </div>
                    <button 
                      onClick={() => {
                        const next = !isThreeStations;
                        setIsThreeStations(next);
                        if (next) setIsTwoStations(false);
                      }}
                      className={cn(
                        "relative w-10 h-5 rounded-full transition-colors",
                        isThreeStations ? 'bg-emerald-600' : 'bg-doc-slate-300'
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-transform",
                        isThreeStations ? 'left-6' : 'left-1'
                      )} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-doc-slate-100">
                  <p className="text-[10px] font-black text-brand-blue uppercase leading-none mb-2">Настройки Станции 1</p>
                  <div className="space-y-2">
                    <StationFields config={station1} setConfig={setStation1} specs={loadedSpecs} />
                    <div className="space-y-1">
                      <label className="text-[10px] font-black underline uppercase">Стоимость ДЭС 1</label>
                      <input 
                        type="number"
                        value={station1.price || ''}
                        onChange={(e) => setStation1({...station1, price: Number(e.target.value)})}
                        className="admin-input font-black text-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                {(isTwoStations || isThreeStations) && (
                  <div className="space-y-4 pt-4 border-t border-brand-blue/10">
                    <p className="text-[10px] font-black text-brand-blue uppercase leading-none mb-2">Настройки Станции 2</p>
                    <div className="space-y-2">
                      <StationFields config={station2} setConfig={setStation2} specs={loadedSpecs} />
                      <div className="space-y-1">
                        <label className="text-[10px] font-black underline uppercase">Стоимость ДЭС 2</label>
                        <input 
                          type="number"
                          value={station2.price || ''}
                          onChange={(e) => setStation2({...station2, price: Number(e.target.value)})}
                          className="admin-input font-black text-brand-blue"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isThreeStations && (
                  <div className="space-y-4 pt-4 border-t border-emerald-600/10">
                    <p className="text-[10px] font-black text-emerald-600 uppercase leading-none mb-2">Настройки Станции 3</p>
                    <div className="space-y-2">
                      <StationFields config={station3} setConfig={setStation3} specs={loadedSpecs} />
                      <div className="space-y-1">
                        <label className="text-[10px] font-black underline uppercase">Стоимость ДЭС 3</label>
                        <input 
                          type="number"
                          value={station3.price || ''}
                          onChange={(e) => setStation3({...station3, price: Number(e.target.value)})}
                          className="admin-input font-black text-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-doc-slate-500 uppercase">Топливо (руб/л)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(Number(e.target.value))}
                      className="admin-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-doc-slate-500 uppercase">ТО (руб/час)</label>
                    <input 
                      type="number"
                      value={toRate}
                      onChange={(e) => setToRate(Number(e.target.value))}
                      className="admin-input"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'blocks' && (
            <motion.div 
              key="blocks-tab"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Видимость и порядок</h3>
                <span className="text-[9px] text-brand-blue font-bold">Elementor View</span>
              </div>
              <div className="space-y-2">
                {blocks.map((block: Block, index: number) => (
                  <div 
                    key={block.id}
                    className="flex items-center gap-3 p-3 bg-doc-slate-50 border border-doc-slate-100 rounded-xl"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        disabled={index === 0}
                        onClick={() => {
                          const newBlocks = [...blocks];
                          [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
                          setBlocks(newBlocks);
                        }}
                        className="text-doc-slate-300 hover:text-brand-blue disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button 
                        disabled={index === blocks.length - 1}
                        onClick={() => {
                          const newBlocks = [...blocks];
                          [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
                          setBlocks(newBlocks);
                        }}
                        className="text-doc-slate-300 hover:text-brand-blue disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-doc-slate-800 uppercase tracking-tight leading-none mb-1">
                        {
                          block.type === 'interactive-container' ? 'Интерактивная схема' : 
                          block.type === 'header' ? 'Шапка КП (Лого)' :
                          block.type === 'contacts' ? 'Контакты' :
                          block.type === 'client-info' ? 'Клиент и менеджер' :
                          block.type === 'message' ? 'Сопроводительное письмо' :
                          block.type === 'purpose' ? 'Назначение ДЭС' :
                          block.type === 'specs' ? 'Технические параметры' :
                          block.type === 'comparison' ? 'Таблица сравнения' :
                          block.type === 'costs' ? 'Эксплуатационные расходы' :
                          block.type === 'control-panel' ? 'Панель управления' :
                          block.type === 'about' ? 'О компании' :
                          block.type === 'footer' ? 'Подвал КП' :
                          block.type.replace('-', ' ')
                        }
                      </p>
                      <p className="text-[8px] text-doc-slate-400 font-bold uppercase tracking-widest">Блок #{index + 1}</p>
                    </div>
                    
                    {block.type === 'purpose' && (
                      <select 
                        value={purposeType}
                        onChange={(e) => setPurposeType(e.target.value as any)}
                        className="bg-white border border-doc-slate-200 text-[9px] font-bold py-1 px-2 rounded outline-none"
                      >
                        {Object.entries(PURPOSES).map(([k, v]) => <option key={k} value={k}>{v.label.slice(0, 10)}...</option>)}
                      </select>
                    )}

                    <button 
                      onClick={() => {
                        const newBlocks = [...blocks];
                        newBlocks[index].isVisible = !newBlocks[index].isVisible;
                        setBlocks(newBlocks);
                        // Sync legacy flags for backward compatibility
                        if (block.type === 'about') setShowCompanyInfo(newBlocks[index].isVisible);
                        if (block.type === 'purpose') setUsePurpose(newBlocks[index].isVisible);
                        if (block.type === 'control-panel') setUseControlPanel(newBlocks[index].isVisible);
                      }}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        block.isVisible ? "bg-brand-blue text-white shadow-sm" : "bg-white text-doc-slate-300"
                      )}
                    >
                      {block.isVisible ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
               key="profile-tab"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               className="space-y-4"
            >
               <h3 className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Мои данные</h3>
               <div className="space-y-3">
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">ФИО</label>
                     <input value={manager.name} onChange={e => setManager({...manager, name: e.target.value})} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">Email</label>
                     <input value={manager.email} onChange={e => setManager({...manager, email: e.target.value})} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">Телефон</label>
                     <input value={manager.phone} onChange={e => setManager({...manager, phone: e.target.value})} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">URL Фото</label>
                     <input value={manager.photoUrl} onChange={e => setManager({...manager, photoUrl: e.target.value})} className="admin-input" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[9px] font-bold text-doc-slate-400 uppercase">Пароль</label>
                     <input type="password" value={manager.password || ''} onChange={e => setManager({...manager, password: e.target.value})} className="admin-input" />
                  </div>
                  <button onClick={updateProfile} className="w-full bg-brand-blue text-white font-black py-3 rounded-xl text-[10px] uppercase">Сохранить профиль</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 border-t border-doc-slate-50 space-y-4">
        <button 
          onClick={onSave}
          disabled={!user}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> Сохранить КП
        </button>
        {currentProposalId && (
          <button 
            onClick={() => {
              const url = `${window.location.origin}/?id=${currentProposalId}`;
              
              // More robust copy method
              const copyToClipboard = (text: string) => {
                if (navigator.clipboard && window.isSecureContext) {
                  return navigator.clipboard.writeText(text);
                } else {
                  // Fallback for non-secure contexts or older browsers
                  const textArea = document.createElement("textarea");
                  textArea.value = text;
                  textArea.style.position = "fixed";
                  textArea.style.left = "-9999px";
                  textArea.style.top = "0";
                  document.body.appendChild(textArea);
                  textArea.focus();
                  textArea.select();
                  try {
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return Promise.resolve();
                  } catch (err) {
                    document.body.removeChild(textArea);
                    return Promise.reject(err);
                  }
                }
              };

              copyToClipboard(url).then(() => {
                alert('Ссылка успешно скопирована!');
              }).catch(() => {
                alert('Не удалось скопировать автоматически. Ссылка: ' + url);
              });
            }}
            className="w-full bg-brand-blue/10 text-brand-blue font-black py-4 rounded-2xl shadow-sm hover:bg-brand-blue hover:text-white transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-3"
          >
            <Copy className="w-4 h-4" /> Копировать ссылку
          </button>
        )}
      </div>
    </aside>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2",
      active ? "bg-white border-brand-blue text-brand-blue shadow-sm" : "border-transparent text-doc-slate-400 hover:text-doc-slate-600"
    )}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const AccountsManagement = ({ currentUser }: { currentUser: User }) => {
  const [managers, setManagers] = useState<ManagerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newManager, setNewManager] = useState({ name: '', email: '', phone: '', password: '', role: 'manager' });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const resp = await fetch('/api/managers');
      if (resp.ok) setManagers(await resp.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newManager)
      });
      if (resp.ok) {
        setShowAdd(false);
        setNewManager({ name: '', email: '', phone: '', password: '', role: 'manager' });
        fetchManagers();
      }
    } catch (e) { alert('Ошибка при создании'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот аккаунт?')) return;
    try {
      const resp = await fetch(`/api/managers/${id}`, { method: 'DELETE' });
      if (resp.ok) fetchManagers();
    } catch (e) { alert('Ошибка при удалении'); }
  };

  if (loading) return <div className="text-center p-4">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black text-doc-slate-500 uppercase tracking-widest">Список менеджеров</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="text-brand-blue p-1 hover:bg-brand-blue/5 rounded">
          {showAdd ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-doc-slate-50 p-4 rounded-xl space-y-3 shadow-inner">
          <input placeholder="Имя" value={newManager.name} onChange={e => setNewManager({...newManager, name: e.target.value})} className="admin-input bg-white text-xs" required />
          <input placeholder="Email" type="email" value={newManager.email} onChange={e => setNewManager({...newManager, email: e.target.value})} className="admin-input bg-white text-xs" required />
          <input placeholder="Пароль" type="password" value={newManager.password} onChange={e => setNewManager({...newManager, password: e.target.value})} className="admin-input bg-white text-xs" required />
          <select value={newManager.role} onChange={e => setNewManager({...newManager, role: e.target.value})} className="admin-input bg-white text-xs">
            <option value="manager">Менеджер</option>
            <option value="admin">Администратор</option>
          </select>
          <button type="submit" className="w-full bg-brand-blue text-white font-black py-2 rounded text-[10px] uppercase tracking-wide">Добавить</button>
        </form>
      )}

      <div className="space-y-2">
        {managers.map(m => (
          <div key={m.id} className="p-3 bg-white border border-doc-slate-100 rounded-xl flex flex-col gap-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-doc-slate-800 leading-none mb-1">{m.name}</p>
                <p className="text-[9px] text-doc-slate-400 font-bold">{m.email}</p>
                <span className={cn(
                  "text-[8px] font-black uppercase px-1.5 py-0.5 rounded",
                  m.role === 'admin' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                )}>
                  {m.role === 'admin' ? 'Админ' : 'Менеджер'}
                </span>
              </div>
              <div className="flex gap-1">
                 <button onClick={() => handleDelete(m.id!)} className="p-1.5 text-doc-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-doc-slate-50 pt-2">
               <div className="flex gap-4">
                  <div className="text-center">
                     <p className="text-[8px] text-doc-slate-400 font-black uppercase">КП</p>
                     <p className="text-xs font-black text-brand-blue">{m.proposalCount || 0}</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[8px] text-doc-slate-400 font-black uppercase">Просм.</p>
                     <p className="text-xs font-black text-emerald-600">{m.totalViews || 0}</p>
                  </div>
               </div>
               <div className="text-[9px] font-bold text-doc-slate-300">
                  {m.password ? 'Пароль установлен' : 'Без пароля'}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const StationFields = ({ config, setConfig, specs }: any) => (
  <div className="space-y-3">
    <select 
      value={config.manufacturerId}
      onChange={(e) => {
        const man = specs.find((m: any) => m.id === e.target.value)!;
        setConfig({ ...config, manufacturerId: e.target.value, modelName: man.models[0].name });
      }}
      className="admin-input text-xs font-bold"
    >
      {specs.map((m: any) => (
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>
    <select 
      value={config.modelName}
      onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
      className="admin-input text-xs font-bold"
    >
      {(specs.find((m: any) => m.id === config.manufacturerId) || specs[0] || {models: []}).models.map((m: any) => (
        <option key={m.name} value={m.name}>{m.nominalPowerKw} кВт ({m.engineModel})</option>
      ))}
    </select>

    <div className="bg-doc-slate-50 p-2 rounded-lg border border-doc-slate-100">
      <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
        const el = document.getElementById(`std-eq-${config.manufacturerId}-${config.modelName}`);
        if (el) el.classList.toggle('hidden');
      }}>
        <span className="text-[8px] font-black uppercase text-doc-slate-500">Базовая комплектация</span>
        <ChevronDown className="w-3 h-3 text-doc-slate-400" />
      </div>
      <div id={`std-eq-${config.manufacturerId}-${config.modelName}`} className="hidden mt-2 space-y-1">
        {STANDARD_EQUIPMENT.map((item, i) => (
          <div key={i} className="flex items-start gap-1">
            <CheckCircle2 className="w-2 h-2 text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-[7.5px] leading-tight text-doc-slate-600 font-medium">{item}</span>
          </div>
        ))}
      </div>
    </div>

    <select 
      value={config.variant}
      onChange={(e) => setConfig({ ...config, variant: e.target.value })}
      className="admin-input text-xs font-bold"
    >
      <option value="open">На раме (открытая)</option>
      <option value="enclosure">В кожухе</option>
      <option value="container">В контейнере</option>
      <option value="sever">В контейнере "Север"</option>
      <option value="mobile">Передвижная (ПЭС)</option>
    </select>
    <label className="flex items-center gap-2 cursor-pointer p-1">
      <input 
        type="checkbox"
        checked={!!config.recommended}
        onChange={(e) => setConfig({ ...config, recommended: e.target.checked })}
        className="w-4 h-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
      />
      <span className="text-[10px] font-black uppercase text-brand-blue">Рекомендуем</span>
    </label>
  </div>
);

const PreviewArea = ({ 
  blocks, station1, station2, station3, p1, p2, p3, manager, fuelPrice, toRate, 
  showCompanyInfo, usePurpose, useControlPanel, purposeType, v1, v2, v3, 
  rec1, rec2, rec3, onBack, isClientView,
  user, onUpdateBlocks
}: any) => {
  const [zoom, setZoom] = useState(1.25); 
  const [activeStationTab, setActiveStationTab] = useState(1);

  const updateBlockConfig = (blockId: string, config: any) => {
    onUpdateBlocks((prev: any) => prev.map((b: any) => b.id === blockId ? { ...b, config } : b));
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1.25);

  const handleDownloadPdf = async () => {
    const element = document.getElementById('proposal-document');
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `KP_Diesel_${station1.nominalPowerKw}kW.pdf`,
      image: { type: 'jpeg' as const, quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        onclone: (clonedDoc: Document) => {
          clonedDoc.body.classList.add('pdf-capture');
          const clonedElement = clonedDoc.getElementById('proposal-document');
          if (clonedElement) {
            clonedElement.classList.add('pdf-mode');
          }
          
          // Fix for html2canvas crashing on oklch/oklab colors (Tailwind 4 default)
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const originalEl = element.getElementsByTagName('*')[i] as HTMLElement;
            
            if (originalEl) {
              const style = window.getComputedStyle(originalEl);
              const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'];
              
              props.forEach(prop => {
                const value = style[prop as any];
                // If it's a modern color function, html2canvas will crash. 
                // We attempt to set a safe fallback or just let it be if it's already rgb/hex.
                if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('color('))) {
                  // Fallback to a safe hex if it's a brand related element, otherwise black/inherit
                  el.style.setProperty(prop, '#002F87', 'important'); 
                }
              });
            }
          }

          // Also strip from any style tags to be safe
          const styleTags = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styleTags.length; i++) {
            styleTags[i].innerHTML = styleTags[i].innerHTML
              .replace(/oklch\([^)]+\)/g, '#002F87')
              .replace(/oklab\([^)]+\)/g, '#002F87')
              .replace(/color-mix\([^)]+\)/g, '#002F87')
              .replace(/color\([^)]+\)/g, '#002F87');
          }
        }
      },
      jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['.page-break-avoid', 'img', 'table', 'tr'] }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <main className={cn(
      "bg-[#ccd5de] p-10 overflow-y-auto no-scrollbar print:p-0 print:bg-white relative",
      isClientView ? "w-full" : "flex-1"
    )}>
      {isClientView && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 no-print pointer-events-none z-50">
          <div className="bg-white px-6 py-2 rounded-full text-xs font-black text-brand-blue shadow-lg pointer-events-auto border border-white">
            ПУБЛИЧНЫЙ ПРОСМОТР
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      {!isClientView && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white/50 no-print z-50">
           <button onClick={handleZoomOut} className="p-2 hover:bg-doc-slate-100 rounded-full transition-colors text-doc-slate-600">
             <Minus className="w-5 h-5" />
           </button>
           <div className="h-6 w-[1px] bg-doc-slate-200 mx-2" />
           <button onClick={handleZoomReset} className="px-3 hover:bg-doc-slate-100 rounded-lg transition-colors text-xs font-black text-brand-blue uppercase">
             {Math.round(zoom * 100 / 1.25)}%
           </button>
           <div className="h-6 w-[1px] bg-doc-slate-200 mx-2" />
           <button onClick={handleZoomIn} className="p-2 hover:bg-doc-slate-100 rounded-full transition-colors text-doc-slate-600">
             <Plus className="w-5 h-5" />
           </button>
        </div>
      )}

      {onBack && (
          <button 
            onClick={onBack}
            className="fixed top-6 right-24 md:right-32 p-4 bg-white text-doc-slate-600 rounded-full shadow-lg no-print transition-all z-50 flex items-center gap-2 group"
          >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden md:inline text-xs font-black uppercase">Назад в панель</span>
        </button>
      )}

  <div className="flex justify-center items-start min-h-full">
    <div 
      id="proposal-document" 
      style={{ transform: `scale(${zoom})` }}
      className="bg-white w-[210mm] shadow-brand-blue origin-top transition-transform print:transform-none print:shadow-none print:w-full flex flex-col pt-0 pb-12"
    >
      <div className="p-0 space-y-0 flex-1 flex flex-col">
        {blocks.filter((b: Block) => b.isVisible).map((block: Block) => {
          switch (block.type) {
            case 'interactive-container':
              return (
                <div key={block.id} className="page-break-avoid page-break-before">
                  <InteractiveContainer 
                    config={block.config}
                    onUpdateConfig={(config) => updateBlockConfig(block.id, config)}
                    isAdmin={user?.email === 'seo@comd.ru'}
                  />
                </div>
              );
            case 'header':
              return <Header key={block.id} />;
            case 'contacts':
              return <div key={block.id} className="px-10 pt-8"><ContactsBar /></div>;
            case 'client-info':
              return (
                <div key={block.id} className="px-10 pt-2 flex justify-between items-start page-break-avoid">
                  <div className="space-y-4 flex-1">
                    <div className="text-[10px] text-doc-slate-500 leading-relaxed text-left px-6 py-4 bg-doc-slate-50 rounded-sm border-l-4 border-brand-blue font-medium italic uppercase max-w-sm">
                      Дизельные электростанции в данном предложении спроектированы для обеспечения максимальной надежности 
                      в самых суровых российских условиях. {station2 ? 'Сравнение представленных моделей позволит выбрать оптимальное решение.' : ''}
                    </div>
                    <h1 className="text-2xl font-black text-brand-blue uppercase tracking-tighter border-b border-doc-slate-100 pb-2">
                      Коммерческое предложение
                    </h1>
                  </div>
                  <ManagerBadge manager={manager} />
                </div>
              );
            case 'message':
               return null; // Integrated into client-info for now
            case 'purpose':
              return usePurpose && (
                <div key={block.id} className="px-10 page-break-avoid bg-[#f8fafc] border border-doc-slate-100 p-6 rounded-sm text-[10px] text-doc-slate-700 leading-relaxed space-y-3 font-semibold text-justify mx-10">
                  {PURPOSES[purposeType as keyof typeof PURPOSES].text.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              );
            case 'specs':
              return (
                <div key={block.id} className="px-10 space-y-8 page-break-avoid">
                  {/* Tabs for Web View */}
                  {(station2 || station3) && (
                    <div className="no-print mb-8 px-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-[1px] flex-1 bg-doc-slate-200" />
                        <span className="text-[9px] font-black text-doc-slate-400 uppercase tracking-[0.2em]">Выберите вариант для сравнения</span>
                        <div className="h-[1px] flex-1 bg-doc-slate-200" />
                      </div>
                      <div className="flex p-1.5 bg-doc-slate-100/80 rounded-2xl gap-1.5 border border-doc-slate-200 shadow-inner">
                        <button 
                          onClick={() => setActiveStationTab(1)}
                          className={cn(
                            "flex-1 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl flex flex-col items-center gap-1.5",
                            activeStationTab === 1 
                              ? "bg-brand-blue text-white shadow-[0_8px_20px_rgba(0,41,107,0.25)] ring-1 ring-brand-blue/20" 
                              : "text-doc-slate-500 hover:bg-white/50 hover:text-doc-slate-700"
                          )}
                        >
                          <span className={cn(
                            "text-[8px] tracking-widest font-bold uppercase",
                            activeStationTab === 1 ? "text-white/60" : "text-doc-slate-400"
                          )}>Вариант 01</span>
                          <span className="flex items-center gap-1.5 font-bold">
                            {station1.name} 
                            {rec1 && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />}
                          </span>
                        </button>
                        
                        {station2 && (
                          <button 
                            onClick={() => setActiveStationTab(2)}
                            className={cn(
                              "flex-1 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl flex flex-col items-center gap-1.5",
                              activeStationTab === 2 
                                ? "bg-brand-blue text-white shadow-[0_8px_20px_rgba(0,41,107,0.25)] ring-1 ring-brand-blue/20" 
                                : "text-doc-slate-500 hover:bg-white/50 hover:text-doc-slate-700"
                            )}
                          >
                            <span className={cn(
                              "text-[8px] tracking-widest font-bold uppercase",
                              activeStationTab === 2 ? "text-white/60" : "text-doc-slate-400"
                            )}>Вариант 02</span>
                            <span className="flex items-center gap-1.5 font-bold">
                              {station2.name} 
                              {rec2 && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />}
                            </span>
                          </button>
                        )}

                        {station3 && (
                          <button 
                            onClick={() => setActiveStationTab(3)}
                            className={cn(
                              "flex-1 px-4 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all rounded-xl flex flex-col items-center gap-1.5",
                              activeStationTab === 3 
                                ? "bg-brand-blue text-white shadow-[0_8px_20px_rgba(0,41,107,0.25)] ring-1 ring-brand-blue/20" 
                                : "text-doc-slate-500 hover:bg-white/50 hover:text-doc-slate-700"
                            )}
                          >
                            <span className={cn(
                              "text-[8px] tracking-widest font-bold uppercase",
                              activeStationTab === 3 ? "text-white/60" : "text-doc-slate-400"
                            )}>Вариант 03</span>
                            <span className="flex items-center gap-1.5 font-bold">
                              {station3.name} 
                              {rec3 && <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Station 1 - Always visible in PDF or if active tab is 1 */}
                  <div className={cn(
                    "space-y-8",
                    (station2 || station3) ? (activeStationTab === 1 ? "block" : "hidden print:block") : "block"
                  )}>
                    <div className="relative">
                       {rec1 && (
                          <div className="absolute -top-3 left-6 bg-brand-blue text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-10">
                            Рекомендуем ⭐
                          </div>
                       )}
                       <SpecSection label={station1.name} model={station1} variant={v1} price={p1} hideLabelWeb={!!(station2 || station3)} />
                    </div>
                  </div>

                  {/* Station 2 */}
                  {station2 && (
                    <div className={cn(
                      "space-y-8",
                      activeStationTab === 2 ? "block" : "hidden print:block"
                    )}>
                      <div className="relative">
                        {rec2 && (
                            <div className="absolute -top-3 left-6 bg-brand-blue text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-10">
                              Рекомендуем ⭐
                            </div>
                        )}
                        <SpecSection label={station2.name} model={station2} variant={v2} price={p2} hideLabelWeb={true} />
                      </div>
                    </div>
                  )}

                  {/* Station 3 */}
                  {station3 && (
                    <div className={cn(
                      "space-y-8",
                      activeStationTab === 3 ? "block" : "hidden print:block"
                    )}>
                      <div className="relative">
                        {rec3 && (
                            <div className="absolute -top-3 left-6 bg-brand-blue text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg z-10">
                              Рекомендуем ⭐
                            </div>
                        )}
                        <SpecSection label={station3.name} model={station3} variant={v3} price={p3} hideLabelWeb={true} />
                      </div>
                    </div>
                  )}
                </div>
              );
            case 'comparison':
              return (station2 || station3) && (
                <div key={block.id} className="px-10 page-break-avoid page-break-before">
                  <Comparison station1={station1} station2={station2} station3={station3} />
                </div>
              );
            case 'costs':
              return (
                <div key={block.id} className="px-10 page-break-avoid">
                  <div className={cn("grid gap-8", station3 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                    <div className="page-break-avoid">
                      <OperatingCosts label={station2 ? station1.name : ""} model={station1} fuelPrice={fuelPrice} toRate={toRate} />
                    </div>
                    {station2 && (
                      <div className="page-break-avoid">
                        <OperatingCosts label={station2.name} model={station2} fuelPrice={fuelPrice} toRate={toRate} />
                      </div>
                    )}
                    {station3 && (
                      <div className="page-break-avoid">
                        <OperatingCosts label={station3.name} model={station3} fuelPrice={fuelPrice} toRate={toRate} />
                      </div>
                    )}
                  </div>
                </div>
              );
            case 'control-panel':
              return useControlPanel && (
                <div key={block.id} className="px-10 page-break-avoid page-break-before">
                  <ControlPanelSection />
                </div>
              );
            case 'about':
              return showCompanyInfo && (
                <div key={block.id} className="px-10 page-break-avoid page-break-before">
                  <AboutCompany />
                </div>
              );
            case 'footer':
              return (
                <div key={block.id} className="px-10 mt-8 page-break-avoid">
                  <div className="text-[9px] text-doc-slate-400 text-justify leading-relaxed border-t border-doc-slate-100 pt-3 italic mb-2 font-bold">
                    <AlertCircle className="w-3 h-3 inline mr-1 -mt-0.5" />
                    Характеристики являются справочными. Окончательные данные фиксируются в договоре.
                  </div>
                  <FooterMini />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  </div>
      
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 no-print z-50">
         <button 
          onClick={handleDownloadPdf}
          className="w-14 h-14 bg-brand-blue text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
         >
           <Download className="w-6 h-6" />
         </button>
      </div>
    </main>
  );
};

const ContactsBar = () => (
  <div className="flex justify-between items-center border-b border-doc-slate-100 pb-4 mb-4 page-break-avoid">
    <div className="flex items-center gap-6">
      <div className="w-40 h-10 flex items-center">
        <img 
          src="/input_file_0.png" 
          alt="Дизель Компания" 
          className="w-full h-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="h-8 w-[1px] bg-doc-slate-200" />
      <div className="space-y-0.5">
        <p className="text-[8px] font-black text-brand-blue uppercase tracking-widest leading-none">Центральный офис</p>
        <p className="text-[9px] font-bold text-doc-slate-500 max-w-[200px] leading-tight">Россия, 150044, г. Ярославль, Ленинградский пр-т, д. 33, оф. 404</p>
      </div>
    </div>
    <div className="text-right space-y-1">
      <div className="flex flex-col items-end">
        <p className="text-lg font-black text-brand-blue tracking-tighter leading-none mb-1">8-800-333-37-01</p>
        <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest text-doc-slate-400">
           <span className="text-brand-blue-dark">SALES@COMD.RU</span>
           <span className="opacity-30">|</span>
           <span className="underline group-hover:text-brand-blue transition-colors">WWW.COMD.RU</span>
        </div>
      </div>
    </div>
  </div>
);

const ManagerBadge = ({ manager }: { manager: ManagerInfo }) => (
  <div className="flex items-center gap-3 bg-doc-blue-50-op50 p-3 rounded-xl border border-brand-blue-op10 min-w-[200px]">
    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-blue shadow-sm bg-white">
      {manager.photoUrl ? (
        <img src={manager.photoUrl} alt="Manager" className="w-full h-full object-cover" />
      ) : (
        <User className="w-6 h-6 text-brand-blue m-auto mt-2" />
      )}
    </div>
    <div className="flex-1">
      <p className="text-[7px] text-doc-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Ваш менеджер</p>
      <p className="text-[11px] font-black text-brand-blue uppercase italic tracking-tighter leading-none mb-1">
        {manager.name || 'ВАШ МЕНЕДЖЕР'}
      </p>
      <p className="text-[9px] font-black text-doc-slate-700 leading-none">{manager.phone || '+7 (4852) 37-01-01'}</p>
      <p className="text-[8px] font-bold text-doc-slate-500 italic lowercase">{manager.email || 'sales@comd.ru'}</p>
    </div>
  </div>
);

const ControlPanelSection = () => (
  <div className="space-y-10 py-12 border-t-2 border-brand-blue-op20 flex flex-col page-break-avoid">
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="flex-1 space-y-4">
        <h3 className="text-xl font-black text-brand-blue uppercase leading-tight border-b-2 border-brand-blue pb-2 flex items-center gap-3">
          <Settings className="w-6 h-6" /> Пульт управления ДЭС
        </h3>
        <div className="space-y-1">
          <p className="text-[14px] font-black text-brand-blue uppercase leading-tight">Пульт управления ДЭС собственной разработки</p>
          <p className="text-[12px] font-bold text-doc-slate-800 leading-relaxed italic border-l-2 border-accent-grey pl-4">
            ООО «Компания Дизель» на основе цифрового контроллера ComAp InteliLiteNT (Чехия ), обеспечивает удобное ручное / автоматическое управление, полный контроль параметров и защиту систем дизельной электростанции.
          </p>
        </div>
      </div>
      <div className="w-full md:w-56 h-56 bg-doc-slate-50 flex items-center justify-center rounded border border-doc-slate-100 overflow-hidden shrink-0 font-black text-doc-slate-300 text-[10px] uppercase text-center p-4 relative">
        <div className="absolute inset-0 from-doc-slate-100 to-transparent" />
<div className="w-full md:w-[350px] bg-white p-2 rounded border border-doc-slate-100 shadow-sm overflow-hidden">
            <img 
              src="/input_file_3.png" 
              alt="Контроллер" 
              className="w-full h-auto object-contain"
              referrerPolicy="no-referrer"
            />
      
          </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-widest bg-doc-blue-50 px-3 py-1 inline-block rounded-sm">Функции и преимущества:</h4>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full">
        {[
          'многофункциональный ЖК-дисплей (8 строк информации, инфо-графика)',
          'полностью русифицированный интерфейс',
          'мембранные влагозащищенные кнопки - простое управление всеми функциями ДЭС',
          'защита доступа с помощью пароля',
          'независимый программируемый таймер – для тестирования, поддержания готовности ДЭС',
          'автоматическая задержка отключения ДЭС с регулируемым периодом охлаждения',
          'системный журнал событий на 119 сообщений',
          'автоматический останов ДЭС',
          'аварийная защита двигателя и генератора',
          'отдельная кнопка аварийного останова ДЭС',
          'счетчик запусков / остановов ДЭС',
          'счетчик наработки моточасов',
          'класс защиты лицевой панели - IP 65',
          'автомат защиты генератора (может быть расположен в пульте управления / отдельном силовом шкафу)'
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-doc-slate-700">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SpecSection = ({ label, model, variant, price, hideLabelWeb }: { label: string, model: ModelSpec, variant: any, price?: number, hideLabelWeb?: boolean }) => (
  <div className="space-y-6 page-break-avoid">
    {/* Section Header - Style from User Snippet */}
    <div className={cn(
      "flex justify-between items-end border-b-2 border-brand-blue pb-2 mb-4 page-break-avoid",
      hideLabelWeb && "hidden print:flex"
    )}>
      <div className="flex items-center gap-4">
        <div className="px-6 py-2 bg-gradient-to-r from-[#00296B] to-[#002F87] rounded-sm shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] relative z-10">{label}</span>
          <div className="absolute inset-0 bg-white/5 skew-x-12 translate-x-12" />
        </div>
        {label !== model.name && (
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-doc-slate-400 uppercase tracking-widest">{model.name}</span>
            <div className="h-1 w-12 bg-accent-grey mt-1 rounded-full" />
          </div>
        )}
      </div>
      {price && price > 0 && (
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-1.5 mb-1">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
             <p className="text-[7px] font-bold uppercase text-doc-slate-500 tracking-wider">Итого с НДС 20%</p>
          </div>
          <p className="text-2xl font-bold text-brand-blue tracking-tighter leading-none italic">
            {price.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      )}
    </div>

    {model.imageUrl && (
      <div className="space-y-4">
        <div className="relative w-full aspect-[16/9] bg-white border border-doc-slate-100 rounded shadow-sm overflow-hidden p-2">
          <div className="absolute inset-0 bg-white pointer-events-none opacity-0" />
          <img 
            src={model.imageUrl} 
            alt={model.name}
            className="w-full h-full object-contain relative z-10"
            referrerPolicy="no-referrer"
                      />
          <div className="absolute top-4 right-4 bg-brand-blue px-3 py-1 rounded-full">
             <p className="text-[8px] text-white font-black uppercase tracking-widest">{model.nominalPowerKw} кВт</p>
          </div>
        </div>
        <img 
          src="/input_file_4.png" 
          alt="Technical View" 
          className="w-[50%] mx-auto h-auto rounded border border-doc-slate-100 shadow-sm" 
          referrerPolicy="no-referrer"
        />
      </div>
    )}

    <div className="grid grid-cols-2 gap-4 gap-y-4">
      {/* Engine Specs */}
      <div className="space-y-4 page-break-avoid min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-6 bg-brand-blue rounded-full" />
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> Двигатель (ДВС)
          </p>
        </div>
        <div className="space-y-1.5">
          <SpecRow label="Модель двигателя" value={model.engineModel} />
          <SpecRow label="Тип двигателя" value={model.engineType} />
          <SpecRow label="Номинальная мощность" value={`${model.nominalPowerKw} кВт`} />
          <SpecRow label="Рабочий объём" value={`${model.displacementL} л`} />
          <SpecRow label="Цилиндры" value={model.cylinders} />
          <SpecRow label="Управление" value={model.controlSystem} />
          <SpecRow label="Система впрыска" value={model.injectionSystem} />
          <SpecRow label="Наддув воздуха" value={model.aspiration} />
          <SpecRow label="Объем охлаждения" value={`${model.coolingL} л`} />
          <SpecRow label="Объем смазки" value={`${model.lubeL} л`} />
          <SpecRow label="Расход 100%" value={`${model.fuelCons100} л/ч`} />
          <SpecRow label="Расход 75%" value={`${model.fuelCons75} л/ч`} />
          <SpecRow label="Расход 50%" value={`${model.fuelCons50} л/ч`} />
          <SpecRow label="Масло на угар" value={model.oilConsRel} />
          <SpecRow label="Удельный расход масла" value={model.oilConsUdel} />
          <SpecRow label="Напряжение" value={model.sysVoltage} />
        </div>
      </div>

      {/* Generator Specs */}
      <div className="space-y-4 page-break-avoid min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-6 bg-brand-blue-dark rounded-full" />
          <p className="text-[10px] font-bold text-brand-blue-dark uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Генератор
          </p>
        </div>
        <div className="space-y-1.5">
          <SpecRow label="Модель генератора" value={model.generatorModel} />
          <SpecRow label="Тип генератора" value={model.genType} />
          <SpecRow label="Сила тока (ном)" value={model.genAmps} />
          <SpecRow label="Мощность" value={`${model.genKw} кВт`} />
          <SpecRow label="Коэффициент cos φ" value={model.genCosPhi} />
          <SpecRow label="КПД 100% / 90%" value={`${model.genEff100} / ${model.genEff90}`} />
          <SpecRow label="Возбуждение" value={model.genExcitation} />
          <SpecRow label="Регулятор" value={model.genRegulator} />
          <SpecRow label="Перегрузка" value={model.genOverload} />
          <SpecRow label="Ток КЗ" value={model.genShortCircuit} />
          <SpecRow label="Обмотки" value={model.genWindings} />
          <SpecRow label="Степень защиты" value={model.genProtection} />
          <SpecRow label="Изоляция" value={model.genInsulation} />
        </div>
        
        <div className="flex items-center gap-2 mb-2 mt-6">
          <div className="w-1.5 h-6 bg-doc-slate-300 rounded-full" />
          <p className="text-[10px] font-bold text-doc-slate-600 uppercase tracking-widest flex items-center gap-1.5">
            <Maximize className="w-3 h-3" /> ДЭС и Габариты
          </p>
        </div>
        <div className="space-y-1.5">
          <SpecRow label="Контроллер" value={model.controller} />
          <SpecRow label="Бак" value={`${model.fuelTankL} л`} />
          <SpecRow label="Автономность 75%" value={model.unattended75} />
          <SpecRow label="Класс электроэнергии" value={model.electricityClass} />
          <SpecRow label="Межсервисный интервал" value={model.serviceInterval} />
          <SpecRow label="Габариты (ДхШхВ)" value={variant === 'open' ? model.dimOpen : (variant === 'container' || variant === 'sever' ? model.dimContainer : model.dimEnclosure)} />
          <SpecRow label="Вес (сухой)" value={`${variant === 'open' ? model.weightOpen : (variant === 'container' || variant === 'sever' ? model.weightContainer : model.weightEnclosure)} кг`} />
        </div>
      </div>
    </div>

    <div className="bg-brand-blue-op5 p-5 rounded-md border border-brand-blue-op10 mt-4 break-inside-avoid shadow-sm shadow-brand-blue/5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-black text-brand-blue uppercase flex items-center gap-2 mt-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Комплектация: {VARIANT_DESCRIPTIONS[variant as keyof typeof VARIANT_DESCRIPTIONS].title}
        </p>
        <div className="w-24 h-16 bg-white rounded border border-brand-blue-op10 overflow-hidden p-1">
           <img 
             src={
               variant === 'open' ? "/genset_open.png" :
               variant === 'enclosure' ? "/genset_canopy.png" :
               variant === 'container' ? "/genset_container.png" :
               variant === 'sever' ? "/genset_container_sever_m.png" :
               "https://www.comd.ru/upload/resize_cache/iblock/12a/470_350_1/12acbf4461bb9fd330089ee0e5414746.jpg" // mobile
             }
             className="w-full h-full object-contain"
             alt={variant}
           />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-2 border-t border-brand-blue-op10">
        {VARIANT_DESCRIPTIONS[variant as keyof typeof VARIANT_DESCRIPTIONS].items.slice(0, 8).map((item, i) => (
          <p key={i} className="text-[8px] text-doc-slate-700 font-bold flex items-start gap-1.5">
            <span className="text-brand-blue mt-0.5">•</span> {item}
          </p>
        ))}
      </div>
    </div>
  </div>
);

const OperatingCosts = ({ label, model, fuelPrice, toRate }: any) => (
  <div className="bg-doc-slate-50 p-6 rounded-lg border-l-4 border-brand-blue shadow-sm shadow-brand-blue/5 w-full">
    <div className="flex items-center gap-3 mb-4">
       <div className="p-1.5 bg-brand-blue text-white rounded-md">
         <Zap className="w-3.5 h-3.5" />
       </div>
       <h4 className="text-[11px] font-black text-brand-blue uppercase tracking-[0.2em]">{label || "Затраты"}</h4>
    </div>
    <div className="space-y-4 font-bold">
      <div className="flex justify-between items-end border-b border-doc-slate-100 pb-2">
        <div className="flex-1">
          <p className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest leading-none mb-1">Топливо (75% нагрузки)</p>
          <p className="text-[7px] text-doc-slate-400 font-bold uppercase leading-none">Тариф: {fuelPrice} ₽/л</p>
        </div>
        <p className="text-[15px] font-black text-brand-blue italic leading-none whitespace-nowrap ml-4">
          {((model.fuelCons75 || 0) * (fuelPrice || 0) * 8000).toLocaleString('ru-RU')} <span className="text-[9px] opacity-70 not-italic uppercase ml-1">₽/год</span>
        </p>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex-1">
          <p className="text-[9px] font-black text-doc-slate-400 uppercase tracking-widest leading-none mb-1">Техническое обслуживание</p>
          <p className="text-[7px] text-doc-slate-400 font-bold uppercase leading-none">Запчасти + Расходники: {toRate} ₽/ч</p>
        </div>
        <p className="text-[15px] font-black text-brand-blue italic leading-none whitespace-nowrap ml-4">
          {((toRate || 0) * 8000).toLocaleString('ru-RU')} <span className="text-[9px] opacity-70 not-italic uppercase ml-1">₽/год</span>
        </p>
      </div>
    </div>
  </div>
);

const FooterMini = () => (
  <div className="pt-8 border-t border-doc-slate-100 mt-8 page-break-avoid">
    <div className="flex justify-between items-center text-doc-slate-400">
      <div className="flex items-center gap-3">
         <Building2 className="w-5 h-5 text-brand-blue opacity-50" />
         <p className="text-[10px] font-black text-brand-blue uppercase tracking-tighter leading-none">Компания Дизель — Сделано в России</p>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">comd.ru | 2006—2026</p>
    </div>
  </div>
);

const SpecRow = ({ label, value }: { label: string, value: any }) => (
  <div className="flex gap-[2px] group">
    <div className="flex-[4] bg-doc-slate-50-op50 px-2 py-0.5 min-h-[14px] flex items-center border-l border-brand-blue-op10 group-hover:bg-brand-blue-op5 transition-colors">
      <span className="text-[7.5px] font-medium text-doc-slate-700 uppercase tracking-tight leading-none">
        {label}
      </span>
    </div>
    <div className="flex-[3] bg-doc-slate-50-op50 px-2 py-0.5 min-h-[14px] flex items-center justify-end border-r border-brand-blue-op10 group-hover:bg-brand-blue-op5 transition-colors">
      <span className="text-[7.5px] font-bold text-brand-blue uppercase tracking-tighter leading-none italic">
        {value === undefined || value === null ? '—' : String(value)}
      </span>
    </div>
  </div>
);
