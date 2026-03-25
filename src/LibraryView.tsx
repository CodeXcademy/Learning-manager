import { motion, Variants } from 'motion/react';
import { Timer, Video, Folder, FileText, ArrowUpRight, Play, MoreHorizontal, Film } from 'lucide-react';

export function LibraryView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-10 max-w-7xl mx-auto w-full"
    >
      {/* Hero / Featured Section */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tight mb-2">My Library</h1>
            <p className="text-on-surface-variant max-w-lg text-sm sm:text-base">Curate your learning experience. Access your projects, videos, and research documents in one cinematic space.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="px-4 py-2 bg-surface-container-highest text-on-surface text-sm font-medium rounded-full hover:bg-surface-bright transition-colors">All Files</button>
            <button className="px-4 py-2 bg-surface-container text-on-surface-variant text-sm font-medium rounded-full hover:bg-surface-container-highest transition-colors">Shared</button>
          </div>
        </div>

        {/* Bento Grid: Featured / In Progress */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:h-[380px] xl:h-[420px]">
          <motion.div 
            variants={itemVariants}
            onClick={() => onNavigate('roadmap')}
            className="lg:col-span-8 relative group cursor-pointer overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/10 min-h-[220px] sm:min-h-[300px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent z-10"></div>
            <img 
              alt="Abstract 3D motion design" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKwzjuZztM_XiAt0SAFdj_VgylIJXeW-V_jeFwwmM1vcb7uq3boqc7JpCQl6324KxEWzO-9bkLzz4Izy0LGP4qd2YItNvUQYSla-vX-KXzdaFNXNVP-JYejCHqiNOV4mYjp4-OBg-uRoFp-HI3jLBW5r4R9ZSNUe-B3IaXdlVHwmTdXVd1qT3cgugJNWeaf0jsGIR2NXmzqPqQ7p7vdorupuNeLcGDLNmjOoXCbf1Y6N8nLmd2F78Rf8S4269fixI07LzpkkFDrgY"
            />
            <div className="absolute bottom-0 left-0 p-8 z-20">
              <span className="px-3 py-1 bg-primary-container text-on-primary text-[10px] font-bold rounded-full uppercase tracking-wider mb-4 inline-block">In Progress</span>
              <h3 className="font-headline text-3xl font-bold text-white mb-2">Mastering Architectural Visualization</h3>
              <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                <span className="flex items-center gap-1.5"><Timer className="w-4 h-4" /> 12h remaining</span>
                <span className="flex items-center gap-1.5"><Video className="w-4 h-4" /> 24 Modules</span>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-4 grid grid-rows-2 gap-6">
            <motion.div variants={itemVariants} className="bg-surface-container rounded-xl p-6 flex flex-col justify-between border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer group">
              <div className="flex justify-between">
                <div className="w-12 h-12 bg-tertiary-container/20 rounded-lg flex items-center justify-center text-tertiary-container">
                  <Folder className="w-6 h-6 fill-current" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h4 className="font-headline font-bold text-lg text-on-surface">Research Assets</h4>
                <p className="text-sm text-on-surface-variant">128 items • Updated 2h ago</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} onClick={() => onNavigate('document-reader')} className="bg-surface-container rounded-xl p-6 flex flex-col justify-between border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer group">
              <div className="flex justify-between">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                  <FileText className="w-6 h-6 fill-current" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h4 className="font-headline font-bold text-lg text-on-surface">Project Roadmap.pdf</h4>
                <p className="text-sm text-on-surface-variant">4.2 MB • Viewed yesterday</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Collections Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Collections</h2>
          <button className="text-primary text-sm font-semibold hover:underline">View All</button>
        </div>
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { title: 'Productivity Workflow', meta: '12 Videos • 4 Documents', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX1bWBEyMRgpKwDSE7aI7bwMqvwfeWG4dUaeS4cQNP_z9bjKZf3M3ifahQ2Fw879pDcgSYRCFKE8xKSfCZt-y66FobcDhnPrQWQve7V31tf2xXCp1VC1nLmgcPK4JoyNLa1506I6indMsnfqIy57EBgx5Qm98LEwol-Vfi3dlesbdeUpVe_UMYj9ZJZRbCawcPTgLtrcODFejFNhP4JkBiuCLp9bI8wJPDHsFJDANQFKaJaMSzdR67IYumCawZ_7OMjTrXCN1edGg' },
            { title: 'Design Systems 101', meta: '8 Videos • 12 Documents', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTMJxr1xXD1F9vcOM1p9s0BGw1awsBNTBfZd4lmjO8ZNCdJrNF5M2DC7pogyIpm6OrpaD309sywxUIEoNc21FlJ-RBg9mjT7_3bUZAEGTosH3P7Mg15zYBSr1-G7yn2LxMDpGkcSi8vMfUH0aN_C9asJTULQCXSAs9dPRwiM2_2iWWr7kuNI173tEvJ5RjWcEIFkqN-MM35q2IdSawAE7cxrDayzhz6AMBWqkB9o48mWh_RyVPBN9gu3DO9l2cf2O0XHktlLUKbKA' },
            { title: 'Fullstack Mastery', meta: '42 Videos • 15 Documents', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8dc_e_O4xL2CmQruOwjVjxtmDHBDyza0zFtLEx4IE5bZ-NZax_iCNtPWPEDiXdYbK4P6zc4HkYH7b0GPWmSY_S_xULiQuHkgEvPKy9SaaB22j92AtmjBA8ONlHUIhkGSVV8laFIytVeogTeymtIlvpaStg4lkHZiIpXCP-qphMkXSfSaBLowwz9GpC4GW-v0_bOvF67pjw5EViqUDtOKfWTVmdfNvSWtFxP_Hk5ta3NXR3AQ8Zv4GgsY5kkbOc9jTQ1YqbFW_nW8' },
            { title: 'AI & Future Tech', meta: '15 Videos • 2 Documents', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADmYCyty397nCd1goPnNeGmus7ONkH3KJaT0osvkI5d91-_nfDj3vqAonYxF58JD68m53HxOTFf7i7f_iw7uzVn0Z1nu9larR1xIOAtD4nRWe1l3uEv0HiSKiwmVDsuPecX0qNU2fK3ty3dKbd3UWpDVyqcUVeCUidE7QDOzua1Ta5FvqqyhI16meYHpxCPldYLjfPJ1mwVEGFxcWLZyKbUZn7u7x-iJnXVTSJtkPn2yxd1VvhW-gH9GVrHpEuHc4kK8Tat1QVbK0' }
          ].map((item, i) => (
            <motion.div variants={itemVariants} key={i} onClick={() => onNavigate('course-player')} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5 hover:bg-surface-container transition-all duration-300 group cursor-pointer">
              <div className="aspect-video relative overflow-hidden">
                <img alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={item.img} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-10 h-10 text-white fill-current" />
                </div>
              </div>
              <div className="p-5">
                <h5 className="font-headline font-bold text-on-surface mb-1">{item.title}</h5>
                <p className="text-xs text-on-surface-variant">{item.meta}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* List View: Recently Added */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline text-2xl font-bold text-on-surface">Recently Added</h2>
        </div>
        <motion.div variants={itemVariants} className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant/10 text-on-surface-variant text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 font-semibold">Date Added</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-outline-variant/5"
            >
              <motion.tr variants={itemVariants} onClick={() => onNavigate('document-reader')} className="hover:bg-surface-container-high/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-on-surface">Branding_Guidelines_v2.pdf</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">PDF Document</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">12.5 MB</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">Just now</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-on-surface-variant hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
              <motion.tr variants={itemVariants} onClick={() => onNavigate('course-player')} className="hover:bg-surface-container-high/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-tertiary" />
                    <span className="text-sm font-medium text-on-surface">Cinematic_Lighting_Tutorial.mp4</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">Video File</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">1.2 GB</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">2 hours ago</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-on-surface-variant hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
              <motion.tr variants={itemVariants} className="hover:bg-surface-container-high/50 transition-colors group cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-on-secondary-container fill-current" />
                    <span className="text-sm font-medium text-on-surface">Client Feedback 2024</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">Folder</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">--</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">Yesterday</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-on-surface-variant hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </motion.tr>
            </motion.tbody>
          </table>
        </motion.div>
      </section>
    </motion.div>
  );
}
