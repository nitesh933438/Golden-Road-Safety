const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Container space
content = content.replace(
  'className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12"',
  'className="max-w-6xl mx-auto space-y-4 sm:space-y-8 animate-in fade-in duration-300 pb-12"'
);

// 2. Hero Section
content = content.replace(
  'rounded-3xl p-4 min-[360px]:p-5 sm:p-6 sm:p-8',
  'rounded-2xl sm:rounded-3xl p-4 sm:p-8'
).replace(
  'className="absolute -right-10 -bottom-10 w-64 h-64',
  'className="absolute -right-10 -bottom-10 w-48 h-48 sm:w-64 sm:h-64'
).replace(
  'px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs',
  'px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs'
).replace(
  'Shield className="w-3.5 h-3.5',
  'Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5'
).replace(
  'text-2xl sm:text-3xl font-black',
  'text-xl min-[360px]:text-2xl sm:text-3xl font-black'
).replace(
  'text-sm sm:text-base text-surface-300',
  'text-xs sm:text-base text-surface-300'
);

// Active emergency banner
content = content.replace(
  'p-4 min-[360px]:p-5 sm:p-6 text-white shadow-2xl space-y-6 animate-in',
  'p-4 sm:p-6 text-white shadow-2xl space-y-4 sm:space-y-6 animate-in'
).replace(
  'text-xl font-bold text-white',
  'text-lg sm:text-xl font-bold text-white'
).replace(
  'gap-4 border-b border-red-800/60 pb-4',
  'gap-3 sm:gap-4 border-b border-red-800/60 pb-3 sm:pb-4'
).replace(
  'grid grid-cols-1 sm:grid-cols-5 gap-3',
  'grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3'
);

// 3. SOS Button area
content = content.replace(
  'p-4 min-[360px]:p-5 sm:p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-6',
  'p-5 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-3 sm:space-y-6'
).replace(
  'w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 text-white flex items-center justify-center ring-8',
  'w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/10 text-white flex items-center justify-center ring-4 sm:ring-8'
).replace(
  'ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-white"',
  'ShieldAlert className="w-8 h-8 sm:w-12 sm:h-12 animate-pulse text-white"'
).replace(
  'space-y-2 max-w-lg',
  'space-y-1 sm:space-y-2 max-w-lg'
).replace(
  'text-xs sm:text-sm font-black uppercase tracking-widest text-red-200',
  'text-[10px] sm:text-sm font-black uppercase tracking-widest text-red-200'
).replace(
  'text-2xl sm:text-4xl font-black text-white tracking-tight',
  'text-xl sm:text-4xl font-black text-white tracking-tight leading-tight sm:leading-none'
).replace(
  'text-sm text-red-100 font-medium',
  'text-xs sm:text-sm text-red-100 font-medium'
).replace(
  'className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-white hover:bg-red-50 text-red-700 font-black text-lg sm:text-xl shadow-2xl hover:scale-102 transition-all active:scale-98 min-h-[56px] flex items-center justify-center gap-3 cursor-pointer"',
  'className="w-full sm:w-auto px-6 sm:px-12 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl bg-white hover:bg-red-50 text-red-700 font-black text-sm sm:text-xl shadow-2xl hover:scale-102 transition-all active:scale-98 min-h-[56px] flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"'
).replace(
  'ShieldAlert className="w-6 h-6 text-red-600"',
  'ShieldAlert className="w-5 h-5 sm:w-6 h-6 text-red-600"'
);

// 4. Grid Cards Container
content = content.replace(
  'grid grid-cols-1 md:grid-cols-2 gap-5',
  'grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5'
);

// Card global replacements
content = content.replace(
  /rounded-3xl p-4 min-\[360px\]:p-5 sm:p-6 transition-all duration-200 space-y-4/g,
  'rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-200 space-y-3 sm:space-y-4'
).replace(
  /space-y-3/g,
  'space-y-2 sm:space-y-3'
).replace(
  /w-12 h-12 rounded-2xl/g,
  'w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl'
).replace(
  /w-6 h-6/g,
  'w-5 h-5 sm:w-6 sm:h-6'
).replace(
  /text-xs font-bold (text-[a-z]+-400)/g,
  'text-[10px] sm:text-xs font-bold $1'
).replace(
  /text-xl font-bold/g,
  'text-lg sm:text-xl font-bold'
).replace(
  /text-xs sm:text-sm text-surface-300 mt-1/g,
  'text-xs sm:text-sm text-surface-300 mt-1 sm:mt-1.5'
).replace(
  /px-5 py-3 rounded-xl/g,
  'px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl'
).replace(
  /font-bold text-sm transition-all/g,
  'font-bold text-xs sm:text-sm transition-all'
).replace(
  /ArrowRight className="w-4 h-4"/g,
  'ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4"'
);

// 5. Metrics section
content = content.replace(
  'rounded-3xl p-4 min-[360px]:p-5 sm:p-6 space-y-4',
  'rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4'
).replace(
  'grid grid-cols-2 sm:grid-cols-4 gap-4',
  'grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4'
).replace(
  /p-4 rounded-2xl bg-surface-800\/50/g,
  'p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-800/50'
).replace(
  /text-2xl font-black/g,
  'text-lg sm:text-2xl font-black'
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log("Updated Dashboard.tsx");
