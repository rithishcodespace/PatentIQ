import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-white">
      <div className="w-full flex flex-col items-center justify-between gap-4 px-4 sm:px-8 lg:px-12 py-8 sm:flex-row">
        <div>
          <p className="font-display font-semibold text-slate-900 text-sm">
            Patent<span className="text-amber-500">IQ</span> Enterprise Engine v1.2
          </p>
          <p className="font-body text-xs text-slate-500 mt-0.5">
            Automated Patent Prior-Art Search & Grounded Analysis Platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-body text-xs text-slate-600">
          <Link to="/search" className="hover:text-indigo-600 transition">
            Semantic Search
          </Link>
          <Link to="/upload" className="hover:text-indigo-600 transition">
            Upload & Compare
          </Link>
          <Link to="/history" className="hover:text-indigo-600 transition">
            PostgreSQL History
          </Link>
          <Link to="/docs-preview" className="hover:text-indigo-600 transition font-semibold text-indigo-700">
            OpenAPI Docs Hub
          </Link>
          <a
            href="http://localhost:3000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="code-chip bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
          >
            Swagger UI (/docs)
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
