import { motion } from 'motion/react';
import { Clock, Star, Play, CircleCheck as CheckCircle, FilePlus, FileText, ExternalLink, Trophy, Lock, Kanban } from 'lucide-react';
import { listContainerVariants as containerVariants, listItemVariants as itemVariants } from './lib/motion';

export function RoadmapView({ onNavigate }: { onNavigate: (view: string) => void }) {

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col min-h-screen"
    >
      {/* Cinematic Hero Header */}
      <section className="relative w-full min-h-[320px] sm:min-h-[420px] lg:h-[580px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            alt="Abstract UI/UX design workspace with neon lighting" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqGY7Vk5fJJL5d7RFu33q7kZwX9CBRFiL0PrnfVp7hQidU391-DvzOcHDqMMqO6nbGJEXqrZAcz5niELQo0-2oMku2GRsyaM2f_pXeuOUea7aoiof9krIwv8d5RGHYvmCDnQiyw6CAYhgJI0KJXCJYaKuf-r5WjZh-4dwNIxtBj8rJ3OjiD--hs4a9B_6XLRU5Ye23XkBEBVvYEKVbvf3AhixPsu6JGjGlHTOgMz12aHVEDYOIzJtjHWtQyFoyfqvdjNOIITloOkI" 
          />
          <div className="absolute inset-0 void-gradient"></div>
        </div>
        
        <div className="relative z-10 px-4 sm:px-8 lg:px-12 pb-6 sm:pb-10 lg:pb-12 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-4 sm:gap-8">
          <motion.div variants={itemVariants} className="flex-1 space-y-4 w-full">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-sm border border-primary/30">In Progress</span>
              <span className="text-on-surface-variant text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" /> 12h 45m total
              </span>
              <span className="text-on-surface-variant text-sm flex items-center gap-1">
                <Star className="w-4 h-4 text-tertiary fill-current" /> 4.9 Rating
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold font-headline tracking-tighter text-on-surface text-balance">Mastering UI/UX Design</h1>
            
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs font-medium text-on-surface-variant">
                <span>Your Progress</span>
                <span>64% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-container w-[64%]"></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3 w-full md:w-auto">
            <button onClick={() => onNavigate('course-player')} className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-lg shadow-[0_10px_20px_rgba(0,209,255,0.2)] flex items-center justify-center gap-2 active:scale-95 transition-all flex-1 md:flex-none">
              <Play className="w-5 h-5 fill-current" />
              Resume Learning
            </button>
            <button className="px-6 py-4 glass-panel text-on-surface font-semibold rounded-lg hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2 active:scale-95 flex-1 md:flex-none">
              <CheckCircle className="w-5 h-5" />
              Mark as Done
            </button>
            <button className="p-4 glass-panel text-on-surface rounded-lg hover:bg-surface-container-highest transition-all active:scale-95 flex items-center justify-center">
              <FilePlus className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16">
        {/* Left Column: Details & Resources */}
        <div className="lg:col-span-8 space-y-16">
          {/* Abstract Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold font-headline text-primary tracking-tight">Abstract</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed font-light">
              Dive deep into the psychology of digital interfaces. This milestone covers the end-to-end journey of a product designer, from initial empathy mapping and wireframing to high-fidelity prototyping in Figma. We focus on the VOID philosophy—creating interfaces that guide users through content with elegance and surgical precision.
            </p>
          </motion.div>

          {/* Resources & Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-bold font-headline text-on-surface tracking-tight">Resources & Content</h2>
              <button className="text-primary text-sm font-semibold hover:underline">View All Materials</button>
            </div>
            
            <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {/* Resource Card 1 */}
              <motion.div variants={itemVariants} onClick={() => onNavigate('course-player')} className="group cursor-pointer">
                <div className="aspect-square bg-surface-container-low rounded-xl mb-3 overflow-hidden transition-all group-hover:bg-surface-container-high relative">
                  <img className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" alt="Video tutorial" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKIJbmJSJBAdfoUmK6ffq69nkxogmUjvjB0b3mRQFUfUE1qBYCcgds3eYG92TwYkLhVxOBsC-btRvpV2Gfvhz02bKc7QoT0nBhZ0Jj19n0KoMvaA0aQgY4y-q-nLYHwERhOdBxn0XuB2zLN8Gv5-gSDeTK2O_ZrFbyU_v4ra8eBncO6y8lA4NdXtZAwoF73OHhi-DeEYS7byiR5brpHBy4o8tYfm75w68gRzCoC_ZLF-5g_BZmoeAQos67gJazE3cj4JUzPNKdrDg" />
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold">18:24</div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-on-primary shadow-xl">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-on-surface truncate">Advanced Color Theory</h3>
                <p className="text-xs text-on-surface-variant">Video Tutorial</p>
              </motion.div>

              {/* Resource Card 2 */}
              <motion.div variants={itemVariants} className="group cursor-pointer">
                <div className="aspect-square bg-surface-container-low rounded-xl mb-3 overflow-hidden transition-all group-hover:bg-surface-container-high flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-sm font-bold text-on-surface truncate">UX Audit Checklist</h3>
                <p className="text-xs text-on-surface-variant">PDF Document</p>
              </motion.div>

              {/* Resource Card 3 */}
              <motion.div variants={itemVariants} className="group cursor-pointer">
                <div className="aspect-square bg-surface-container-low rounded-xl mb-3 overflow-hidden transition-all group-hover:bg-surface-container-high relative">
                  <img className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" alt="Figma design interface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCurF6WQrvWJv8mz9Sy-QAIRcyVWwt4edpAuTfLV_qrAHhLkYCMs2tHMQgNgqPzpLZ71Y13zxmNK6zVq0-6HAXw0SlxZNRFDZm4kbuH6tw0sgjnYiBOny9wkhmDH6kgMVDDW7RnDv8i2AOdWqZ6glDZqLEYkCCAtM2V1OAI5R1Ma9M1ErRZjlNX_gysPGMd8F2DodEfCykm0ySeyKprDYiz2YCBd6cLddysH5u0yBTGNR9dHKbger7g59epDotolKcUyAgGizFlhE8" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-10 h-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-on-surface truncate">Figma Assets Library</h3>
                <p className="text-xs text-on-surface-variant">External Link</p>
              </motion.div>

              {/* Resource Card 4 */}
              <motion.div variants={itemVariants} onClick={() => onNavigate('course-player')} className="group cursor-pointer">
                <div className="aspect-square bg-surface-container-low rounded-xl mb-3 overflow-hidden transition-all group-hover:bg-surface-container-high relative">
                  <img className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" alt="Presentation" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDppV-4cI77yAx3q1RtjsoxDA4ZKCjkgfceMua4ZrGGD2FcWoYk_E6lRVaJyqb-1SRyerDyebgP7lKNdV5RVgYR6Ud2b2W5Ur3TOTlyT3C7MYMuhTLIOrR6AujRX-krCMg5uQ-lyHSj7nmN8l2AZfGYwZi2ndqHgkUwC97rtPndMT4515rlJU1ynfXYK3GjCK3KgU7xYQN8K4K3SslrmWGJBZ5iz8hrr2rrmKddg-SBrmfy6gBFM_KlsoccpR8m0a5vNYlAJ7DwBv8" />
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold">42:00</div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-on-primary shadow-xl">
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-on-surface truncate">Case Study Breakdown</h3>
                <p className="text-xs text-on-surface-variant">Workshop Recording</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Roadmap Info Card */}
          <motion.div variants={itemVariants} className="bg-surface-container rounded-xl p-8 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Milestone Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Complexity</span>
                <span className="text-tertiary text-sm font-bold">Advanced</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Instructor</span>
                <span className="text-on-surface text-sm font-medium">Marcus Sterling</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Last Accessed</span>
                <span className="text-on-surface text-sm font-medium">2 hours ago</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-outline-variant/10">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">Reward</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">+500 Curator XP</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Related Path Items */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-lg font-bold font-headline text-on-surface">Next in Path</h3>
            <motion.div variants={containerVariants} className="space-y-4">
              {/* Next Item 1 */}
              <motion.div variants={itemVariants} className="group flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-outline-variant/20 hover:bg-surface-container-low transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" alt="Code blocks" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHtDo2dNPIghgLcqKKJG97NnaA4VXTtrPThxuiCjvkHw1ls2Yl-RsQOq7JNWURcbAZJ7EyC6azDsX3wTygCBJ8NbcAwkiz6xjsGX0Vaq8XYO6bWbB-h34kNmGSRu6BujoAEr509ThM6ER5vuEgi-J6a-lTDEq50yq_mszLYMjbxmKyr0QN4LIr2H2EfLo5pe-DVFrf5xd5FKDagQ-HHVaKzjtXbkZlK6tJC3SULMEgrz4pdtd2jijSMaiNA9NiHfuamNloziZo4s4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-on-surface line-clamp-1">Design-to-Code Systems</h4>
                  <p className="text-xs text-on-surface-variant">2.5 hours • Milestone 05</p>
                </div>
                <Lock className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </motion.div>

              {/* Next Item 2 */}
              <motion.div variants={itemVariants} className="group flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-outline-variant/20 hover:bg-surface-container-low transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" alt="Web architecture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWOL09Dk2wu9ktAt6n1wqk2G2ZcCUgpofT5W10axIqRBECoNWJIvWH4JXB46E2U29kchY7wS5mFzt9pLGsv3G_rVWgZ7rNG8ze1Alu3k64IxYhLu-Uj9bt7and7wmgKqkkqDnMsSau5u7eyPSo4fgzqZnqNFw2hfyiIQiYGwACddZhxTWqTSNDbHd3DOpORHOWIJxZu99alPfcfTMAonsOR1d_6xBAmnTrOhxK081_8_Dv8mM4ufSXG4Bn6shM11jfSLk0buH0MGM" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-on-surface line-clamp-1">Prototyping Motion</h4>
                  <p className="text-xs text-on-surface-variant">4 hours • Milestone 06</p>
                </div>
                <Lock className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
              </motion.div>
            </motion.div>
          </motion.div>
        </aside>
      </section>

      {/* Footer Padding */}
      <footer className="py-12 mt-auto border-t border-outline-variant/5">
        <div className="px-8 lg:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-on-surface-variant text-xs gap-4">
          <span>© 2026 VOID - Learning System</span>
          <div className="flex gap-6">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Support Center</a>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
