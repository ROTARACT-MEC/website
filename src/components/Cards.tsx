import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'

interface CardGridProps {
  children: React.ReactNode
  cols?: number
}

const CardGrid: React.FC<CardGridProps> = ({ children, cols = 3 }) => {
  const colsClass = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }

  return (
    <div
      className={`grid grid-cols-1 ${colsClass[cols as keyof typeof colsClass]} gap-6 md:gap-8`}
    >
      {children}
    </div>
  )
}

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -8 } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`glass-card p-6 md:p-8 ${hover ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}

export const CoordinatorCard: React.FC<{
  image?: string
  name: string
  role: string
  department?: string
  description?: string
  social?: { facebook?: string; instagram?: string; linkedin?: string }
  imageFit?: 'cover' | 'contain'
  imagePosition?: string
}> = ({ image, name, role, department, description, social, imageFit = 'cover', imagePosition }) => {
  const [imageSrc, setImageSrc] = useState(image || '/coordinators/default.png')

  const handleError = () => {
    setImageSrc('/coordinators/default.png')
  }

  return (
    <GlassCard className="h-full flex flex-col justify-between">
      <div className="text-center flex-grow flex flex-col justify-between">
        <div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mb-4 overflow-hidden rounded-lg h-[300px] w-full bg-pink-50/50 border border-pink-100 flex items-center justify-center"
          >
            <img
              src={imageSrc}
              alt={name}
              onError={handleError}
              style={{ objectFit: imageFit, objectPosition: imagePosition }}
              className="w-full h-full"
            />
          </motion.div>
          <h3 className="text-xl font-bold text-navy mb-1">{name}</h3>
          <p className="text-roseaccent font-semibold mb-1">{role}</p>
          {department && (
            <p className="text-sm text-textgray mb-3">{department}</p>
          )}
          {description && (
            <p className="text-textgray text-sm mb-4 leading-relaxed">{description}</p>
          )}
        </div>
        {social && (
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-100 mt-auto">
            {social.facebook && (
              <a
                href={social.facebook}
                className="text-textgray hover:text-roseaccent smooth-transition hover:scale-110 transform flex items-center justify-center"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook size={22} />
              </a>
            )}
            {social.instagram && (
              <a
                href={social.instagram}
                className="text-textgray hover:text-roseaccent smooth-transition hover:scale-110 transform flex items-center justify-center"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram size={22} />
              </a>
            )}
            {social.linkedin && (
              <a
                href={social.linkedin}
                className="text-textgray hover:text-roseaccent smooth-transition hover:scale-110 transform flex items-center justify-center"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin size={22} />
              </a>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}

export const EventCard: React.FC<{
  title: string
  date: string
  location?: string
  image?: string
  description?: string
  registrationLink?: string
}> = ({ title, date, location, image, description, registrationLink }) => {
  return (
    <GlassCard>
      {image && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mb-4 overflow-hidden rounded-lg"
        >
          <img src={image} alt={title} className="w-full h-40 object-cover" />
        </motion.div>
      )}
      <h3 className="text-xl font-bold text-navy mb-2">{title}</h3>
      <div className="space-y-2 mb-4">
        <p className="text-sm text-roseaccent font-semibold">{date}</p>
        {location && <p className="text-sm text-textgray">{location}</p>}
      </div>
      {description && (
        <p className="text-textgray text-sm mb-4 leading-relaxed">{description}</p>
      )}
      {registrationLink && (
        <motion.a
          whileHover={{ scale: 1.05 }}
          href={registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2.5 bg-cranberry text-white font-semibold rounded-[14px] hover:shadow-premium hover:bg-cranberry/90 smooth-transition text-sm"
        >
          Register Now
        </motion.a>
      )}
    </GlassCard>
  )
}

export const BlogCard: React.FC<{
  title: string
  author: string
  date: string
  coverImage?: string
  excerpt?: string
  tags?: string[]
  onClick?: () => void
}> = ({ title, author, date, coverImage, excerpt, tags, onClick }) => {
  return (
    <GlassCard onClick={onClick} hover={!!onClick}>
      {coverImage && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mb-4 overflow-hidden rounded-lg h-40"
        >
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
      <h3 className="text-xl font-bold text-navy mb-2 line-clamp-2">
        {title}
      </h3>
      <div className="flex items-center gap-2 text-sm text-textgray mb-3">
        <span>{author}</span>
        <span>•</span>
        <span>{date}</span>
      </div>
      {excerpt && (
        <p className="text-textgray text-sm mb-4 line-clamp-3 leading-relaxed">{excerpt}</p>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 bg-roseaccent/10 text-roseaccent font-medium rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

export const ActivityCard: React.FC<{
  title: string
  description: string
  date?: string
  category?: string
  image?: string
}> = ({ title, description, date, category, image }) => {
  return (
    <GlassCard>
      {image && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="mb-4 overflow-hidden rounded-lg h-40"
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
      <h3 className="text-xl font-bold text-navy mb-2">{title}</h3>
      {category && (
        <span className="inline-block px-2.5 py-1 bg-roseaccent/10 text-roseaccent text-xs font-semibold rounded-full mb-3">
          {category}
        </span>
      )}
      <p className="text-textgray text-sm mb-3 leading-relaxed">{description}</p>
      {date && <p className="text-xs text-textgray opacity-80">{date}</p>}
    </GlassCard>
  )
}

export default CardGrid
