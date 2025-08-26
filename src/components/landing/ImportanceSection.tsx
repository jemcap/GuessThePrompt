import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.1,
    },
  }),
};

const ImportanceSection = () => {
  return (
    <motion.section
      className="bg-gradient-to-br from-black via-slate-700 to-black mx-auto px-4 py-20 relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="max-w-6xl mx-auto">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-center text-white mb-6 drop-shadow-xl"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        Everything Is Shifting.
      </motion.h2>

      <motion.p
        className="text-lg text-white text-center mb-12 max-w-4xl mx-auto drop-shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        In today's rapidly evolving workplace, the ability to communicate effectively with AI has become as essential as traditional skills like writing or data analysis. With 85% of employers prioritising AI upskilling initiatives, prompt engineering isn't just for developers—it's becoming the universal language of productivity in the AI era.
      </motion.p>

      {/* Industry Examples Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        custom={0}
        viewport={{ once: true }}
        >
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Marketing</h3>
        <p className="text-gray-200 text-sm">Generate campaigns, analyse data, personalise content</p>
        </motion.div>

        <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        custom={1}
        viewport={{ once: true }}
        >
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Education</h3>
        <p className="text-gray-200 text-sm">Create curricula, assess learning, provide tutoring</p>
        </motion.div>

        <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        custom={2}
        viewport={{ once: true }}
        >
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Research</h3>
        <p className="text-gray-200 text-sm">Literature reviews, data analysis, hypothesis generation</p>
        </motion.div>

        <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        custom={3}
        viewport={{ once: true }}
        >
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Operations</h3>
        <p className="text-gray-200 text-sm">Process automation, quality control, optimisation</p>
        </motion.div>
      </div>

      {/* Key Statistics */}
      <motion.div
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <div className="grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-3xl font-bold text-blue-400 mb-2">85%</h3>
          <p className="text-white">of employers prioritise AI upskilling initiatives</p>
          <p className="text-xs text-gray-300 mt-1">World Economic Forum, 2025</p>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-purple-400 mb-2">10-50%</h3>
          <p className="text-white">productivity improvements with proper AI workflow integration</p>
          <p className="text-xs text-gray-300 mt-1">MIT & BCG Studies</p>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-green-400 mb-2">$2.6-4.4T</h3>
          <p className="text-white">annual economic impact potential in knowledge work</p>
          <p className="text-xs text-gray-300 mt-1">McKinsey & Goldman Sachs, 2023</p>
        </div>
        </div>
      </motion.div>
      </div>
    </motion.section>
  );
};

export default ImportanceSection;