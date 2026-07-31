import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import PatentConstellation from "../components/common/PatentConstellation";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  },
};

const Landing = () => {
  return (
    <section className="mx-auto grid min-h-[85vh] max-w-7xl items-center gap-16 px-6 py-12 lg:grid-cols-2">
      {/* Left — thesis */}
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.p
          variants={item}
          className="code-chip mb-4 inline-block bg-indigo-50 text-indigo-600"
        >
          IPC / CPC-AWARE SEMANTIC SEARCH
        </motion.p>

        <motion.h1
          variants={item}
          className="font-display text-5xl font-semibold leading-[1.08] text-ink lg:text-6xl"
        >
          Know if it's
          <br />
          been done<span className="text-amber">.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-md font-body text-lg leading-8 text-slate"
        >
          PatentAI reads your invention the way an examiner would, then
          searches millions of filings by meaning, not keywords —
          built for MSME innovators who can't afford a slow first opinion.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex items-center gap-4">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 font-body text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Start a search
            <span aria-hidden>→</span>
          </Link>
          <a
            href="#how-it-works"
            className="font-body text-sm font-medium text-slate hover:text-indigo"
          >
            How it works
          </a>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-14 flex gap-8 border-t border-slate-100 pt-6"
        >
          <div>
            <p className="font-display text-2xl text-ink">140M+</p>
            <p className="font-body text-xs text-slate">Filings indexed</p>
          </div>
          <div>
            <p className="font-display text-2xl text-ink">&lt;30s</p>
            <p className="font-body text-xs text-slate">Avg. search time</p>
          </div>
          <div>
            <p className="font-display text-2xl text-ink">₹0</p>
            <p className="font-body text-xs text-slate">To start</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Right — signature visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
        className="blueprint-grid relative h-[480px] overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-indigo/[0.03] to-transparent"
      >
        <PatentConstellation className="h-full w-full" />
      </motion.div>
    </section>
  );
};

export default Landing;
