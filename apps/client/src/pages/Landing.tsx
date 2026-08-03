import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Search, UploadCloud, ArrowRight } from 'lucide-react';
import LandingGraph from '../components/common/LandingGraph';

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
  },
};

const metrics = [
  { value: '140M+', label: 'Patents indexed' },
  { value: '<1.5s', label: 'Avg. response time' },
  { value: 'Top-K', label: 'Ranked prior art' },
];

const Landing = () => {
  return (
    <section className="mx-auto grid min-h-[82vh] max-w-7xl items-center gap-12 px-4 py-8 lg:grid-cols-2 lg:gap-16 lg:px-6">
      {/* Left Column — Headline & Actions */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-7">
        <motion.div variants={item} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Prior-Art Intelligence
          </p>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] leading-[1.15]"
        >
          Automated prior-art search and{' '}
          <span className="text-indigo-600">novelty analysis</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="font-body text-base text-slate-500 leading-relaxed max-w-xl"
        >
          Evaluate invention disclosures against global patent databases. Identify prior art,
          analyze overlapping claims, and assess patentability with citation-backed reports.
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-body text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:bg-slate-800 active:bg-slate-950"
          >
            <Search className="h-4 w-4" />
            Start search
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 font-body text-sm font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
          >
            <UploadCloud className="h-4 w-4 text-slate-400" />
            Upload invention draft
          </Link>
        </motion.div>

        {/* Metrics */}
        <motion.dl
          variants={item}
          className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 pt-6"
        >
          {metrics.map((m, i) => (
            <div key={m.label} className={i === 0 ? 'pr-4' : 'px-4'}>
              <dd className="font-display text-xl font-bold text-slate-900 tabular-nums">
                {m.value}
              </dd>
              <dt className="font-body text-xs text-slate-400 mt-1">{m.label}</dt>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* Right Column — Patent Constellation Visual */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
      >
        <LandingGraph className="w-full" />
      </motion.div>
    </section>
  );
};

export default Landing;