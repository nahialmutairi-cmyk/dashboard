export interface TranslationSet {
  // Navigation
  dashboardTab: string;
  editTab: string;
  reportsTab: string;
  settingsTab: string;
  logoutBtn: string;
  adminUser: string;
  superAdmin: string;
  agencyAdminSub: string;

  // Login Screen
  loginTitle: string;
  adminAccessOnly: string;
  emailLabel: string;
  passwordLabel: string;
  forgotBtn: string;
  signInBtn: string;
  authenticating: string;
  accessGranted: string;
  securityNotice: string;
  secureCloud: string;
  keySec: string;

  // Dashboard Tab
  clientMgt: string;
  clientMgtSub: string;
  searchPlaceholder: string;
  addNewClientBtn: string;
  totalReach: string;
  conversion: string;
  activeNow: string;
  activeLabel: string;
  inactiveLabel: string;
  visitsLabel: string;
  clicksLabel: string;
  copyLinkBtn: string;
  copiedBtn: string;
  previewBtn: string;
  editCampaignBtn: string;
  noClientsTitle: string;
  noClientsSub: string;
  clearFilterBtn: string;

  // Add Client Modal
  addClientModalTitle: string;
  displayNameLabel: string;
  roleSpecialtyLabel: string;
  bioLabel: string;
  selectProfilePic: string;
  orCustomUrl: string;
  selectCoverBanner: string;
  simulatedVisits: string;
  simulatedClicks: string;
  cancelBtn: string;
  createAccountBtn: string;

  // Edit Client Screen
  editClientTitle: string;
  editClientSub: string;
  discardBtn: string;
  saveClientBtn: string;
  profileInfoTitle: string;
  avatarPortrait: string;
  avatarUrlLabel: string;
  bannerUrlLabel: string;
  platformConnectivity: string;
  standardSlots: string;
  slotSubtitle: string;
  customCampaignsTitle: string;
  addNewCustomLink: string;
  noCustomLinks: string;
  linkTitleLabel: string;
  navigationUrlLabel: string;
  publicVisibilityTitle: string;
  publicVisibilitySub: string;
  indexedPublicly: string;
  privateOnly: string;
  realtimeMockupTitle: string;
  realtimeMockupSub: string;

  // Settings Screen
  systemSettingsTitle: string;
  agencyConfigTitle: string;
  workspaceUrlLabel: string;
  apiCacheLabel: string;
  saveSystemBtn: string;

  // Account Screen
  adminProfileTitle: string;
  superAdminCreds: string;
  contactEmailLabel: string;
  assignedRoleLabel: string;
  updateDetailsBtn: string;

  // Reports Screen
  agencyReportsTitle: string;
  reportingServerOnline: string;
  reportingServerSub: string;
  downloadCsvBtn: string;

  // Previewer
  featuredCampaigns: string;
  connectWithMe: string;
  callNow: string;
  whatsappChat: string;
  emailMe: string;
  poweredBy: string;
  googleMapsLocation: string;

  // System Toast Messages
  toastAuthSuccess: string;
  toastAddedClient: string;
  toastSavedClient: string;
  toastRemovedClient: string;
  toastDiscarded: string;
  toastSettingsUpdated: string;
  toastDetailsChanged: string;
  toastCsvReady: string;
  toastSelectToEdit: string;
  arabicLangToggle: string;
  englishLangToggle: string;
}

export const translations: Record<'en' | 'ar', TranslationSet> = {
  en: {
    dashboardTab: "Dashboard",
    editTab: "Edit Clients",
    reportsTab: "Reports",
    settingsTab: "Settings",
    logoutBtn: "Log Out",
    adminUser: "Admin User",
    superAdmin: "Super Admin",
    agencyAdminSub: "Agency Admin",

    loginTitle: "Media Land",
    adminAccessOnly: "Admin Access Only",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    forgotBtn: "Forgot?",
    signInBtn: "Sign In",
    authenticating: "Authenticating...",
    accessGranted: "Access Granted",
    securityNotice: "Only authorized agency admins can access this dashboard. Unauthorized access attempts are monitored and recorded.",
    secureCloud: "SECURE CLOUD",
    keySec: "AES-256",

    clientMgt: "Client Management",
    clientMgtSub: "Oversee and manage your premium agency accounts",
    searchPlaceholder: "Search clients...",
    addNewClientBtn: "Add New Client",
    totalReach: "Total Reach",
    conversion: "Conversion",
    activeNow: "Active Now",
    activeLabel: "Active",
    inactiveLabel: "Inactive",
    visitsLabel: "Visits",
    clicksLabel: "Clicks",
    copyLinkBtn: "Copy Link",
    copiedBtn: "Copied!",
    previewBtn: "Preview",
    editCampaignBtn: "Edit Campaign",
    noClientsTitle: "No Agency Clients Found",
    noClientsSub: "No results match your search keywords. Try editing the spelling or clear the filter to view all campaigns.",
    clearFilterBtn: "Clear Filter Keywords",

    addClientModalTitle: "Add Premium Agency Client",
    displayNameLabel: "Display Name",
    roleSpecialtyLabel: "Role / Industry Specialty",
    bioLabel: "Professional Biography",
    selectProfilePic: "Select Profile Picture",
    orCustomUrl: "Or Custom URL",
    selectCoverBanner: "Select Campaign Cover Banner",
    simulatedVisits: "Simulated Visits",
    simulatedClicks: "Simulated Clicks",
    cancelBtn: "Cancel",
    createAccountBtn: "Create Account",

    editClientTitle: "Edit Client",
    editClientSub: "Modify Campaign links & public branding in real-time",
    discardBtn: "Discard Changes",
    saveClientBtn: "Save Client",
    profileInfoTitle: "Profile Information",
    avatarPortrait: "Profile Portrait",
    avatarUrlLabel: "Avatar Image URL",
    bannerUrlLabel: "Background Cover Banner URL",
    platformConnectivity: "Platform Connectivity",
    standardSlots: "10 Standard Slots",
    slotSubtitle: "Toggle slot activity on card",
    customCampaignsTitle: "Custom Campaigns",
    addNewCustomLink: "Add New Link",
    noCustomLinks: "No custom links added yet. Expand your profile reach with bespoke Campaign URLs!",
    linkTitleLabel: "Link Title text",
    navigationUrlLabel: "Navigation URL",
    publicVisibilityTitle: "Public Profile Visibility",
    publicVisibilitySub: "Configure whether search engine robots index this digital profile.",
    indexedPublicly: "INDEXED PUBLICLY",
    privateOnly: "PRIVATE ONLY",
    realtimeMockupTitle: "Real-time Mobile Mockup",
    realtimeMockupSub: "Watch changes reflect in preview instantly",

    systemSettingsTitle: "System Settings",
    agencyConfigTitle: "Agency Configuration",
    workspaceUrlLabel: "Workspace URL hosting namespace",
    apiCacheLabel: "Dynamic API caching expiration",
    saveSystemBtn: "Save Global System Configurations",

    adminProfileTitle: "Administrator Profile",
    superAdminCreds: "Super Administrator credential group",
    contactEmailLabel: "Contact Email",
    assignedRoleLabel: "Assigned permissions role",
    updateDetailsBtn: "Update Details",

    agencyReportsTitle: "Agency Performance Reports",
    reportingServerOnline: "Reporting Server Online",
    reportingServerSub: "All metrics of reach and conversion are aggregated successfully. The workspace tracking layer is successfully measuring clicks and conversions in real-time.",
    downloadCsvBtn: "Download Performance Statement CSV",

    featuredCampaigns: "Featured Campaigns",
    connectWithMe: "Connect With Me",
    callNow: "Call Now",
    whatsappChat: "WhatsApp Chat",
    emailMe: "Email Me",
    poweredBy: "Powered by",
    googleMapsLocation: "Google Maps Location",

    toastAuthSuccess: "Authenticated Successfully! Loaded command dashboard.",
    toastAddedClient: "Added Client successfully!",
    toastSavedClient: "Saved details for client successfully!",
    toastRemovedClient: "Removed client campaign profile.",
    toastDiscarded: "Editing modification discarded.",
    toastSettingsUpdated: "System configuration settings updated successfully.",
    toastDetailsChanged: "Administrator details updated.",
    toastCsvReady: "Performance CSV compiled and ready.",
    toastSelectToEdit: "Please create an agency client to edit first!",
    arabicLangToggle: "العربية",
    englishLangToggle: "English"
  },
  ar: {
    dashboardTab: "لوحة التحكم",
    editTab: "تعديل العملاء",
    reportsTab: "التقارير",
    settingsTab: "الإعدادات",
    logoutBtn: "تسجيل الخروج",
    adminUser: "المسؤول الأول",
    superAdmin: "مشرف عام",
    agencyAdminSub: "إدارة الوكالة",

    loginTitle: "ميديا لاند",
    adminAccessOnly: "دخول المسؤولين فقط",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    forgotBtn: "نسيت؟",
    signInBtn: "تسجيل الدخول",
    authenticating: "جاري التحقق...",
    accessGranted: "تم منح الإذن بالدخول",
    securityNotice: "يُسمح فقط لمدراء الوكالة المعتمدين بالوصول إلى هذه اللوحة. جميع محاولات الدخول غير المصرح بها تخضع للمراقبة والتسجيل.",
    secureCloud: "سحابة آمنة",
    keySec: "تشفير AES-256",

    clientMgt: "إدارة العملاء",
    clientMgtSub: "الإشراف والتحكم في حسابات عملاء الوكالة المتميزين بالكامل",
    searchPlaceholder: "البحث عن عميل...",
    addNewClientBtn: "إضافة عميل جديد",
    totalReach: "إجمالي الوصول",
    conversion: "معدل التحويل",
    activeNow: "النشطين الآن",
    activeLabel: "نشط",
    inactiveLabel: "غير نشط",
    visitsLabel: "زيارات",
    clicksLabel: "نقرات",
    copyLinkBtn: "نسخ الرابط",
    copiedBtn: "تم النسخ!",
    previewBtn: "معاينة",
    editCampaignBtn: "تعديل الحملة",
    noClientsTitle: "لم يتم العثور على أي عملاء للوكالة",
    noClientsSub: "لم تتطابق أي نتائج مع كلمات البحث التي أدخلتها. فيرجى التحقق من الإملاء أو مسح التصفية لرؤية جميع الحملات.",
    clearFilterBtn: "إعادة تعيين كلمات التصفية",

    addClientModalTitle: "إضافة عميل متميز للوكالة",
    displayNameLabel: "الاسم المعروض",
    roleSpecialtyLabel: "الدور الوظيفي / تخصص الصناعة",
    bioLabel: "نبذة مهنية تعريفية",
    selectProfilePic: "اختر الصورة الشخصية",
    orCustomUrl: "أو رابط مخصص",
    selectCoverBanner: "اختر صورة غلاف الحملة",
    simulatedVisits: "الزيارات الافتراضية",
    simulatedClicks: "النقرات الافتراضية",
    cancelBtn: "إلغاء",
    createAccountBtn: "إنشاء الحساب",

    editClientTitle: "تعديل بيانات العميل",
    editClientSub: "تحديث روابط الحملة الإعلانية والهوية البصرية فورياً",
    discardBtn: "تجاهل التغييرات",
    saveClientBtn: "حفظ بيانات العميل",
    profileInfoTitle: "المعلومات الشخصية والمهنية",
    avatarPortrait: "صورة الملف الشخصي",
    avatarUrlLabel: "رابط الصورة الشخصية",
    bannerUrlLabel: "رابط صورة غلاف الخلفية",
    platformConnectivity: "منصات التواصل والربط",
    standardSlots: "١٠ حقول قياسية متوفرة",
    slotSubtitle: "تفعيل الخدمة أو إيقافها لعرضها على الكرت الرقمي",
    customCampaignsTitle: "روابط الحملات المخصصة",
    addNewCustomLink: "إضافة رابط جديد",
    noCustomLinks: "لم يتم إضافة روابط مخصصة بعد. قم بتوسيع نطاق وصول العميل وجذب الزوار بإضافة روابط حملات مخصصة!",
    linkTitleLabel: "نص عنوان الرابط",
    navigationUrlLabel: "رابط التوجيه والملاحة",
    publicVisibilityTitle: "ظهور الملف الرقمي العام",
    publicVisibilitySub: "تحديد إمكانية أرشفة الملف الرقمي بواسطة محركات البحث العامة.",
    indexedPublicly: "متاح ومؤرشف عاماً",
    privateOnly: "رابط خاص ومخفي فقط",
    realtimeMockupTitle: "معاينة حية للهاتف المحمول",
    realtimeMockupSub: "شاهد التغييرات الفورية على الكرت الرقمي للعميل",

    systemSettingsTitle: "إعدادات النظام الإداري",
    agencyConfigTitle: "تهيئة إعدادات الوكالة الإعلانية",
    workspaceUrlLabel: "مساحة استضافة وتسمية نطاق الروابط",
    apiCacheLabel: "مدة انتهاء صلاحية كاش الواجهة البرمجية",
    saveSystemBtn: "حفظ إعدادات النظام الرئيسية",

    adminProfileTitle: "ملف المسؤول",
    superAdminCreds: "مجموعة صلاحيات الإدارة الشاملة للنظام",
    contactEmailLabel: "البريد الإلكتروني للاتصال",
    assignedRoleLabel: "الدور والصلاحية المعينة",
    updateDetailsBtn: "تحديث البيانات الشخصية",

    agencyReportsTitle: "تقارير أداء الوكالة الإعلانية",
    reportingServerOnline: "خادم التقارير نشط ومتصل بالشبكة",
    reportingServerSub: "تم دمج وجمع كافة إحصائيات ونسب أداء العملاء المتميزين بنجاح. خادم القياس يقوم بمراقبة اللمسات والنقرات في الوقت الفعلي بأعلى دقة.",
    downloadCsvBtn: "تحميل كشف بيان الأداء بصيغة CSV",

    featuredCampaigns: "حملات إعلانية مميزة",
    connectWithMe: "تواصل معي مباشرة",
    callNow: "اتصال هاتفي",
    whatsappChat: "دردشة واتساب",
    emailMe: "مراسلتي بريدياً",
    poweredBy: "مشغل بواسطة",
    googleMapsLocation: "الموقع الجغرافي على الخرائط",

    toastAuthSuccess: "تم التحقق من نجاح الدخول! تحميل لوحة التحكم الفورية.",
    toastAddedClient: "تمت إضافة العميل بنجاح وتم توليد كرت الهاتف الذكي!",
    toastSavedClient: "تم حفظ وتوثيق بيانات العميل بنجاح!",
    toastRemovedClient: "تم إزالة وإلغاء الحملة الرقمية للعميل المحدد.",
    toastDiscarded: "تم إلغاء التعديلات المقترحة والرجوع للوضع السابق.",
    toastSettingsUpdated: "تم تحديث إعدادات تهيئة النظام العام وحفظها بنجاح.",
    toastDetailsChanged: "تم تحديث بيانات ملف المشرف العام بنجاح.",
    toastCsvReady: "تم تصدير كشف ملف CSV وهو جاهز للتحميل المباشر.",
    toastSelectToEdit: "فيرجى إنشاء عميل جديد للوكالة أولاً حتى تتمكن من التعديل عليه!",
    arabicLangToggle: "العربية",
    englishLangToggle: "English"
  }
};
