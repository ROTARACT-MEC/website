import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/PageHeader'
import { Section } from '@/components/Common'
import CardGrid, { CoordinatorCard } from '@/components/Cards'
import { coordinatorService } from '@/services/coordinatorService'
import { useSEO } from '@/hooks'
import { Coordinator } from '@/types'

// Centralized priority mapping for sorting team member roles (highest priority first)
const rolePriority: Record<string, number> = {
  "Charter President": 1,
  "Immediate Past President": 2,
  "Charter President Elect": 3,
  "Charter Vice President": 4,
  "Charter Secretary": 5,
  "Charter Joint Secretary": 6,
  "Charter Treasurer": 7,
  "Club Service Chair": 8,
  "Community Service Chair": 9,
  "International Service Chair": 10,
  "Professional Service Chair": 11,
  "Web Service Chair": 12,
  "Social Media Chair": 13,
  "Membership Chair": 14,
  "Club Editor": 15,
  "Sergeant at Arms": 16,
  "Director": 17,
  "Member": 18,
  "Volunteer": 19
};

const CoordinatorsPage = () => {
  useSEO({
    title: 'Members',
    description: 'Meet the members of Rotaract Club MEC Thrikkakara - leaders dedicated to service and community engagement.',
    keywords: 'Members, Leadership, Rotaract MEC, Team',
    ogDescription: 'Meet the leadership team of Rotaract Club MEC Thrikkakara.',
  })
  const [coordinators, setCoordinators] = useState<Coordinator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        const data = await coordinatorService.getAll()
        setCoordinators(data)
      } catch (error) {
        console.error('Error fetching coordinators:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCoordinators()
  }, [])

  // Sort coordinators according to rolePriority immediately before rendering, 
  // preserving their relative order for non-prioritized or equal-priority roles.
  const sortedCoordinators = useMemo(() => {
    return [...coordinators]
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const priorityA = rolePriority[a.item.role] ?? Infinity
        const priorityB = rolePriority[b.item.role] ?? Infinity

        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
        // Fallback to preserve the original order of fetching
        return a.index - b.index
      })
      .map(({ item }) => item)
  }, [coordinators])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen pt-20">
      <PageHeader
        title="Our Members"
        subtitle="Meet the Leaders"
        description="Dedicated individuals driving our mission of service and leadership"
      />

      <Section id="coordinators">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-cranberry border-t-transparent rounded-full" />
            </div>
            <p className="text-textgray mt-4">Loading members...</p>
          </div>
        ) : coordinators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textgray text-lg">No members found</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <CardGrid cols={3}>
              {sortedCoordinators.map((coordinator) => (
                <motion.div
                  key={coordinator.id}
                  variants={itemVariants}
                >
                  <CoordinatorCard
                    name={coordinator.name}
                    role={coordinator.role}
                    department={coordinator.department}
                    description={coordinator.description}
                    image={coordinator.image}
                    social={coordinator.social}
                  />
                </motion.div>
              ))}
            </CardGrid>
          </motion.div>
        )}
      </Section>

      {/* About Leadership Section */}
      <Section title="Our Leadership Philosophy" id="philosophy">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h3 className="text-2xl font-bold text-navy mb-4">
              Servant Leadership
            </h3>
            <p className="text-textgray leading-relaxed">
              Our members embody the principle of servant leadership,
              prioritizing the needs of the community and members. They lead by
              example, demonstrating commitment and dedication in every project.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h3 className="text-2xl font-bold text-navy mb-4">
              Collaborative Vision
            </h3>
            <p className="text-textgray leading-relaxed">
              We believe in collaborative decision-making where every voice is
              heard and valued. Together, our members work towards creating
              opportunities for growth and positive change.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* Roles and Responsibilities */}
      <Section title="Member Roles" id="roles">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              role: 'President',
              responsibilities: [
                'Overall leadership and vision',
                'Strategic planning',
                'External relations',
              ],
            },
            {
              role: 'Vice President',
              responsibilities: [
                'Event organization',
                'Project management',
                'Member engagement',
              ],
            },
            {
              role: 'Secretary',
              responsibilities: [
                'Communication management',
                'Meeting coordination',
                'Documentation',
              ],
            },
            {
              role: 'Treasurer',
              responsibilities: [
                'Financial management',
                'Budget planning',
                'Fundraising oversight',
              ],
            },
            {
              role: 'Public Relations',
              responsibilities: [
                'External communications',
                'Media relations',
                'Brand management',
              ],
            },
            {
              role: 'Membership Director',
              responsibilities: [
                'Member recruitment',
                'Retention programs',
                'Membership development',
              ],
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6"
            >
              <h4 className="text-xl font-bold text-navy mb-4">
                {item.role}
              </h4>
              <ul className="space-y-2">
                {item.responsibilities.map((resp, i) => (
                  <li key={i} className="text-textgray text-sm flex items-start">
                    <span className="text-roseaccent mr-2 font-bold">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Join Section */}
      <Section className="bg-gradient-to-r from-navy via-purpleaccent to-cranberry rounded-[20px] shadow-xl p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-12"
        >
          <h3 className="text-3xl md:text-4xl font-bold font-serif text-white mb-6">
            Interested in Leadership?
          </h3>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            If you have the passion and dedication to lead, we encourage you to
            apply for a member position in our next term.
          </p>
          <a
            href="#"
            className="inline-block px-8 py-3 bg-cranberry text-white font-semibold rounded-[14px] hover:bg-cranberry/90 smooth-transition hover:shadow-premium"
          >
            Apply for Leadership
          </a>
        </motion.div>
      </Section>
    </div>
  )
}

export default CoordinatorsPage
