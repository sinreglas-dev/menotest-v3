import type { LucideIcon } from 'lucide-react';

interface Props {
   title: string;
   value: string | number;
   description: string;
   icon: LucideIcon;
   variant?: 'primary' | 'success' | 'warning' | 'neutral';
}

const variants = {
   primary: 'bg-[#f5eaf5] text-[#6e0b6c]',
   success: 'bg-emerald-50 text-emerald-600',
   warning: 'bg-amber-50 text-amber-600',
   neutral: 'bg-slate-100 text-slate-600'
};

export default function KpiCard({ title, value, description, icon: Icon, variant = 'primary' }: Props) {
   return (
      <article className="rounded-2xl border border-[#eee7ee] bg-white p-5 shadow-sm sm:p-6">

         <div className="flex items-start justify-between gap-4">
            <div>
               <p className="text-sm font-medium text-[#6b7280]">{title}</p>
               <p className="mt-2 text-3xl font-bold tracking-tight text-[#171717]">{value}</p>
            </div>

            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${variants[variant]}`}>
               <Icon size={21} />
            </div>
         </div>

         <p className="mt-4 text-xs text-[#9ca3af]">{description}</p>

      </article>
   );
}