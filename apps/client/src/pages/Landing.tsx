import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Search, UploadCloud, ArrowRight } from 'lucide-react';
import PatentConstellation from '../components/common/PatentConstellation';

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
  },
};

const Landing = () => {
  return (
    <section className="mx-auto grid min-h-[82vh] max-w-7xl items-center gap-12 px-4 py-8 lg:grid-cols-2 lg:px-6">
      {/* Left Column — Clean Headline & Actions */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.h1
          variants={item}
          className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight"
        >
          Automated Prior-Art Search & Novelty Analysis
        </motion.h1>

        <motion.p
          variants={item}
          className="font-body text-base text-slate-600 leading-relaxed max-w-xl"
        >
          Evaluate invention disclosures against global patent databases. Identify prior art, analyze overlapping claims, and evaluate patentability with instant citation reports.
        </motion.p>

        <motion.div variants={item} className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-body text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Search className="h-4 w-4" />
            Start Search
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            to="/upload"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-body text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <UploadCloud className="h-4 w-4 text-blue-600" />
            Upload Invention Draft
          </Link>
        </motion.div>

        {/* Clean Metrics Summary */}
        <motion.div
          variants={item}
          className="grid grid-cols-3 gap-6 border-t border-slate-200/80 pt-6 text-slate-900"
        >
          <div>
            <p className="font-display text-2xl font-bold text-slate-900">140M+</p>
            <p className="font-body text-xs text-slate-500 mt-0.5">Patents Indexed</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-slate-900">&lt;1.5s</p>
            <p className="font-body text-xs text-slate-500 mt-0.5">Avg. Response Time</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-slate-900">Top-K</p>
            <p className="font-body text-xs text-slate-500 mt-0.5">Ranked Prior Art</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Column — 3D Patent Constellation Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
        className="blueprint-grid relative h-[440px] overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 shadow-sm"
      >
        <PatentConstellation className="h-full w-full" />
      </motion.div>
    </section>
  );
};

export default Landing;
