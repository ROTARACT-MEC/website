export const subscriberService = {
  async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Mock saving subscriber to local storage for local offline capability
      const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('subscribers', JSON.stringify(subscribers));
      }
      return { success: true, message: 'Thank you for subscribing to our blog!' }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error)
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      }
    }
  },
}
