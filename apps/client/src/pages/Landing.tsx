import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <section className="min-h-[80vh] flex items-center">

      <div className="grid lg:grid-cols-2 gap-16 items-center">

        {/* Left */}

        <div>

          <p className="text-blue-600 font-semibold mb-3">
            AI Powered Patent Search
          </p>

          <h1 className="text-5xl font-bold text-gray-900 leading-tight">

            Automated Patent
            <br />
            Prior-Art Search
            <br />
            Engine

          </h1>

          <p className="mt-6 text-gray-600 text-lg leading-8">

            Discover similar patents using semantic similarity,
            intelligent ranking and AI-generated patentability
            reports.

          </p>

          <Link
            to="/search"
            className="inline-block mt-10 bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-xl transition"
          >
            Start Search →
          </Link>

        </div>

        {/* Right */}

        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl h-[450px] flex items-center justify-center">

          <h2 className="text-3xl font-bold text-blue-700">

            Patent Search Illustration

          </h2>

        </div>

      </div>

    </section>
  );
};

export default Landing;