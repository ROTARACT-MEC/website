import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiChartBar, HiTag, HiHeart } from 'react-icons/hi'
import PageHeader from '@/components/PageHeader'
import { Section } from '@/components/Common'
import CardGrid, { ActivityCard } from '@/components/Cards'
import { activityService } from '@/services/activityService'
import { useSEO } from '@/hooks'
import { Activity } from '@/types'

const ActivitiesPage = () => {
  useSEO({
    title: 'Activities',
    description: 'Explore the various activities and initiatives by Rotaract Club MEC Thrikkakara - from workshops to community service.',
    keywords: 'Activities, Community Service, Workshops, Events, Volunteer',
    ogDescription: 'Discover the activities and community service projects of Rotaract Club MEC.',
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  const categories = [
    'All',
    'Workshop',
    'Health',
    'Environment',
    'Youth',
    'Relief',
    'Education',
    'Sports',
    'Women',
  ]

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityService.getAll()
        setActivities(data)
        setFilteredActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredActivities(activities)
    } else {
      setFilteredActivities(
        activities.filter((activity) => activity.category === selectedCategory)
      )
    }
  }, [selectedCategory, activities])

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
        title="Our Activities"
        subtitle="Making an Impact"
        description="Explore the diverse projects and initiatives we undertake to serve our community"
      />

      {/* Category Filter */}
      <Section id="activities">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold smooth-transition ${
                selectedCategory === category
                  ? 'bg-gradient-gold text-dark-950 shadow-lg shadow-gold-500/50'
                  : 'glass-card-dark text-gold-400 hover:text-gold-300'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full" />
            </div>
            <p className="text-gray-400 mt-4">Loading activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No activities found</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <CardGrid cols={3}>
              {filteredActivities.map((activity) => (
                <motion.div key={activity.id} variants={itemVariants}>
                  <ActivityCard
                    title={activity.title}
                    description={activity.description}
                    category={activity.category}
                    image={activity.image}
                    date={
                      activity.date
                        ? new Date(activity.date).toLocaleDateString()
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </CardGrid>
          </motion.div>
        )}
      </Section>

      {/* Timeline Section */}
      <Section title="Activity Timeline" id="timeline">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="space-y-8">
            {activities.slice(0, 5).map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card-dark p-6 flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-gold bg-opacity-20 flex items-center justify-center">
                    <span className="text-gold-400 font-bold">
                      {idx + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-white">
                      {activity.title}
                    </h4>
                    {activity.date && (
                      <span className="text-sm text-gold-400 font-semibold">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    {activity.description}
                  </p>
                  {activity.category && (
                    <span className="inline-block px-3 py-1 bg-primary-600 bg-opacity-30 text-primary-300 text-xs rounded-full">
                      {activity.category}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* Stats Section */}
      <Section id="stats">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              number: activities.length,
              label: 'Total Activities',
              icon: HiChartBar,
            },
            {
              number: categories.length - 1,
              label: 'Categories',
              icon: HiTag,
            },
            {
              number: '3+',
              label: 'Life Changing Events',
              icon: HiHeart,
            },
          ].map((stat, idx) => {
            const IconComponent = stat.icon
            return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card-dark p-8 text-center"
            >
              <IconComponent className="mx-auto text-5xl text-pink-500 mb-4" />
              <div className="text-4xl font-bold text-gradient mb-2">
                {stat.number}
              </div>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
            )
          })}
        </div>
      </Section>


    </div>
  )
}

export default ActivitiesPage
