import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/PageHeader'
import { Section } from '@/components/Common'
import { useSEO } from '@/hooks'
import { fetchStrapi, normalizeStrapiItem } from '@/services/strapi'
import {
  FaHandHoldingHeart,
  FaBriefcase,
  FaLightbulb,
  FaUsers,
  FaGlobe,
  FaHandshake,
  FaCrown,
  FaCalendarAlt,
  FaTools,
  FaUserFriends,
} from 'react-icons/fa'

interface IntroductionData {
  title: string
  vision: string | string[]
  mission: string
  purpose: string
  history: string
  values: Array<{ title: string; description: string }>
}

const IntroductionPage = () => {
  const [data, setData] = useState<IntroductionData | null>(null)
  const [loading, setLoading] = useState(true)

  useSEO({
    title: 'About Us',
    description: 'Learn about Rotaract Club of Model Engineering College, Thrikkakara - our vision, mission, values, and history.',
    keywords: 'About Rotaract, MEC Thrikkakara, Vision, Mission, Leadership',
    ogDescription: 'Discover the vision and mission of Rotaract Club MEC Thrikkakara.',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchStrapi('/api/introduction?populate=*')
        if (response && response.data) {
          setData(normalizeStrapiItem<IntroductionData>(response.data))
        }
      } catch (error) {
        console.error('Error fetching introduction data from Strapi:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-cranberry border-t-transparent rounded-full" />
          </div>
          <p className="text-textgray mt-4">Loading About Details...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-textgray text-lg">Failed to load about details.</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen pt-20 about-page">
      <PageHeader
        title={data.title}
        subtitle="Empowering Leaders Since 2015"
        description="Discover our story, values, and commitment to community service"
      />

      {/* Who We Are Section */}
      <Section title="Who We Are" id="who-we-are">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 space-y-6"
          >
            <p className="text-2xl font-bold text-navy font-serif leading-relaxed">
              Serving the community, building leaders, and fostering fellowship at MEC.
            </p>
            <p className="text-textgray text-lg leading-relaxed">
              {data.purpose}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 rounded-[20px] blur-lg opacity-30 transform -rotate-2" />
            <img
              src="/D9690B7D-97F2-4509-87AB-334547FCB9F5.PNG"
              alt="Rotaract MEC Community"
              className="relative rounded-[20px] shadow-lg border border-white/20 w-full object-cover h-64 md:h-80"
            />
          </motion.div>
        </div>
      </Section>

      {/* Vision & Mission Section */}
      <Section title="Our Vision & Mission" id="vision-mission">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h3 className="text-3xl font-bold text-gradient mb-4 font-serif">Vision</h3>
            <ul className="list-disc pl-5 space-y-2 text-textgray text-lg leading-relaxed">
              {(() => {
                const vision = data.vision;
                if (Array.isArray(vision)) return vision;
                if (!vision) return [];
                
                // Fallback / standard split for old paragraph
                if (typeof vision === 'string' && (vision.includes('Empowering youth') || vision.length < 5)) {
                  return [
                    'Empower youth to become changemakers.',
                    'Build inclusive and sustainable communities.',
                    'Create lasting impact through service and leadership.'
                  ];
                }
                
                // Split by periods followed by space/end
                return vision
                  .split(/\.(?=\s|$)/)
                  .map(s => s.trim())
                  .filter(Boolean)
                  .map(s => s.endsWith('.') ? s : `${s}.`);
              })().map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h3 className="text-3xl font-bold text-gradient mb-4 font-serif">Mission</h3>
            <p className="text-textgray text-lg leading-relaxed">
              {data.mission}
            </p>
          </motion.div>
        </div>
      </Section>

      {/* What We Do Section */}
      <Section title="What We Do" id="what-we-do">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: FaHandHoldingHeart,
              title: 'Community Service',
              description: 'Engaging in local volunteering, educational support, and community welfare initiatives.',
            },
            {
              icon: FaBriefcase,
              title: 'Professional Development',
              description: 'Hosting expert talk sessions, career bootcamps, and technical skill workshops.',
            },
            {
              icon: FaLightbulb,
              title: 'Leadership Development',
              description: 'Providing student leadership platforms, public speaking, and project governance opportunities.',
            },
            {
              icon: FaUsers,
              title: 'Club Service',
              description: 'Organizing sports, fellowship gatherings, and cultural events to build a strong bond among members.',
            },
            {
              icon: FaGlobe,
              title: 'International Understanding',
              description: 'Collaborating with Rotaract clubs worldwide to build international friendship and cultural ties.',
            },
            {
              icon: FaHandshake,
              title: 'Fellowship & Networking',
              description: 'Connecting students with expert alumni, professional mentors, and the wider global network.',
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-8 hover:shadow-premium smooth-transition"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-6 text-pink-600">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-navy mb-3">{item.title}</h4>
                <p className="text-textgray text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* Core Values Section */}
      <Section title="The Rotaract Way" id="values">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.values.map((value, idx) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-8 flex gap-5 items-start"
            >
              <div className="w-12 h-12 rounded-xl bg-roseaccent/10 flex items-center justify-center text-roseaccent flex-shrink-0 font-bold text-lg">
                {idx + 1}
              </div>
              <div>
                <h4 className="text-xl font-bold text-navy mb-2">
                  {value.title}
                </h4>
                <p className="text-textgray text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Why Join Section */}
      <Section title="Why Join Rotaract MEC?" id="why-join">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: FaCrown,
              title: 'Leadership Opportunities',
              description: 'Lead large initiatives, manage project teams, and hone your personal leadership style.',
            },
            {
              icon: FaUsers,
              title: 'Professional Networking',
              description: 'Build relationships with prominent speakers, industry guides, and global Rotary members.',
            },
            {
              icon: FaCalendarAlt,
              title: 'Event Management',
              description: 'Develop execution skills by managing event planning, marketing campaigns, and budgets.',
            },
            {
              icon: FaHandHoldingHeart,
              title: 'Social & Local Impact',
              description: 'Directly volunteer and make a difference in social welfare, education, and the environment.',
            },
            {
              icon: FaTools,
              title: 'Professional Skills',
              description: 'Accelerate your growth in coding, public speaking, visual design, and resource planning.',
            },
            {
              icon: FaUserFriends,
              title: 'Lifelong Friendships',
              description: 'Create unforgettable student memories with an active, welcoming community of friends.',
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex-shrink-0 flex items-center justify-center text-pink-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-navy mb-2">{item.title}</h4>
                  <p className="text-textgray text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* History Section */}
      <Section title="Our History" id="history">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 max-w-3xl mx-auto"
        >
          <p className="text-lg text-textgray leading-relaxed mb-6 text-center">
            {data.history}
          </p>
        </motion.div>
      </Section>
    </div>
  )
}

export default IntroductionPage
