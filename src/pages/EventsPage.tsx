import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCalendar, HiChartBar, HiHeart, HiClock, HiLocationMarker } from 'react-icons/hi'
import { subscriberService } from '@/services/subscriberService'
import { FaTools, FaDollarSign } from 'react-icons/fa'
import { GiMountainClimbing } from 'react-icons/gi'
import PageHeader from '@/components/PageHeader'
import { Section } from '@/components/Common'
import CardGrid, { EventCard } from '@/components/Cards'
import { eventService } from '@/services/eventService'
import { useSEO } from '@/hooks'
import { Event } from '@/types'

const EventsPage = () => {
  useSEO({
    title: 'Events',
    description: 'Upcoming and past events by Rotaract Club MEC Thrikkakara. Join us for community service and leadership development.',
    keywords: 'Events, Upcoming Events, Rotaract MEC, Community',
    ogDescription: 'Check out the upcoming events hosted by Rotaract Club MEC Thrikkakara.',
  })
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [loading, setLoading] = useState(true)

  // Subscriber system states
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [submittingSubscriber, setSubmittingSubscriber] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 4000)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscriberEmail) {
      showToast('Please enter an email address.', 'error')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(subscriberEmail)) {
      showToast('Please enter a valid email address.', 'error')
      return
    }

    setSubmittingSubscriber(true)
    try {
      const res = await subscriberService.subscribe(subscriberEmail)
      if (res.success) {
        showToast(res.message, 'success')
        setSubscriberEmail('')
      } else {
        showToast(res.message, 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Subscription failed. Please try again.', 'error')
    } finally {
      setSubmittingSubscriber(false)
    }
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [upcoming, past] = await Promise.all([
          eventService.getUpcoming(),
          eventService.getPast(),
        ])
        setUpcomingEvents(upcoming)
        setPastEvents(past)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents
  const tabVariants = {
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
        title="Events"
        subtitle="Join Our Community"
        description="Explore our upcoming events and celebrate our past milestones"
      />

      {/* Tab Navigation */}
      <Section id="events">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex gap-4 justify-center mb-12"
        >
          {['upcoming', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'upcoming' | 'past')}
              className={`px-8 py-3 font-semibold rounded-[14px] smooth-transition text-lg ${
                activeTab === tab
                  ? 'bg-cranberry text-white shadow-premium'
                  : 'bg-white text-textgray border border-gray-100 hover:text-cranberry hover:shadow-sm'
              }`}
            >
              {tab === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-cranberry border-t-transparent rounded-full" />
            </div>
            <p className="text-textgray mt-4">Loading events...</p>
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textgray text-lg">
              No {activeTab} events found
            </p>
          </div>
        ) : (
          <motion.div
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            key={activeTab}
          >
            <CardGrid cols={3}>
              {displayEvents.map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <EventCard
                    title={event.title}
                    date={new Date(event.date).toLocaleDateString()}
                    location={event.location}
                    image={event.image}
                    description={event.description}
                    registrationLink={
                      activeTab === 'upcoming' ? event.registrationLink : undefined
                    }
                  />
                </motion.div>
              ))}
            </CardGrid>
          </motion.div>
        )}
      </Section>

      {/* Calendar View Section */}
      <Section title="Event Calendar" id="calendar">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-card p-8"
        >
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-navy mb-4">
              Monthly Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blush rounded-xl border border-cranberry/10">
                <h4 className="text-lg font-semibold text-cranberry mb-4 flex items-center gap-2">
                  <HiCalendar /> Upcoming Events
                </h4>
                <p className="text-4xl font-bold text-navy mb-2">
                  {upcomingEvents.length}
                </p>
                <p className="text-textgray">events planned</p>
              </div>
              <div className="p-6 bg-blush rounded-xl border border-cranberry/10">
                <h4 className="text-lg font-semibold text-cranberry mb-4 flex items-center gap-2">
                  <HiChartBar /> Past Events
                </h4>
                <p className="text-4xl font-bold text-navy mb-2">
                  {pastEvents.length}
                </p>
                <p className="text-textgray">events completed</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* Event Categories */}
      <Section title="Event Categories" id="categories">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Summit', icon: GiMountainClimbing, color: 'from-blue-500' },
            { name: 'Workshop', icon: FaTools, color: 'from-purple-500' },
            { name: 'Service', icon: HiHeart, color: 'from-red-500' },
            { name: 'Fundraiser', icon: FaDollarSign, color: 'from-green-500' },
          ].map((category, idx) => {
            const IconComponent = category.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 text-center hover:shadow-md smooth-transition"
              >
                <IconComponent className="text-4xl mx-auto mb-3 text-roseaccent" />
                <h4 className="text-lg font-bold text-navy">{category.name}</h4>
              </motion.div>
            )
          })}
        </div>
      </Section>

      {/* Featured Events */}
      {upcomingEvents.length > 0 && (
        <Section
          title="Featured Event"
          id="featured"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 max-w-3xl mx-auto"
          >
            {upcomingEvents[0].image && (
              <div className="mb-8 overflow-hidden rounded-lg h-64 md:h-80">
                <img
                  src={upcomingEvents[0].image}
                  alt={upcomingEvents[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h3 className="text-3xl md:text-4xl font-bold text-navy mb-4 font-serif">
              {upcomingEvents[0].title}
            </h3>
            <div className="space-y-3 mb-6 text-textgray">
              <p className="flex items-center gap-2">
                <HiCalendar className="text-roseaccent" />
                {new Date(upcomingEvents[0].date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {upcomingEvents[0].time && (
                <p className="flex items-center gap-2">
                  <HiClock className="text-roseaccent" />
                  {upcomingEvents[0].time}
                </p>
              )}
              {upcomingEvents[0].location && (
                <p className="flex items-center gap-2">
                  <HiLocationMarker className="text-roseaccent" />
                  {upcomingEvents[0].location}
                </p>
              )}
            </div>
            {upcomingEvents[0].description && (
              <p className="text-lg text-textgray mb-8 leading-relaxed">
                {upcomingEvents[0].description}
              </p>
            )}
            {upcomingEvents[0].registrationLink && (
              <a
                href={upcomingEvents[0].registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-cranberry text-white font-semibold rounded-[14px] hover:bg-cranberry/90 smooth-transition hover:shadow-premium"
              >
                Register Now
              </a>
            )}
          </motion.div>
        </Section>
      )}

      {/* Newsletter Section */}
      <Section className="bg-gradient-to-r from-navy via-purpleaccent to-cranberry rounded-[20px] shadow-xl p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-12"
        >
          <h3 className="text-3xl md:text-4xl font-bold font-serif text-white mb-6">
            Stay Connected
          </h3>
          <p className="text-lg text-white/80 mb-8">
            Subscribe once to receive updates on our latest events, blogs, and club announcements.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={subscriberEmail}
              onChange={(e) => setSubscriberEmail(e.target.value)}
              disabled={submittingSubscriber}
              className="flex-1 px-4 py-3 rounded-[14px] bg-white border border-gray-100 text-navy placeholder-textgray/60 focus:outline-none focus:border-cranberry disabled:opacity-75"
            />
            <button
              type="submit"
              disabled={submittingSubscriber}
              className="px-6 py-3 bg-cranberry text-white font-semibold rounded-[14px] hover:bg-cranberry/90 hover:shadow-premium smooth-transition disabled:opacity-75 flex items-center justify-center min-w-[120px]"
            >
              {submittingSubscriber ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
        </motion.div>
      </Section>

      {/* Premium Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: '-50%' }}
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-[14px] shadow-premium text-white font-medium ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                : 'bg-gradient-to-r from-rose-500 to-cranberry'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <span className="whitespace-nowrap">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventsPage
