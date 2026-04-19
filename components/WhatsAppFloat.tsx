'use client'

const WA_NUMBER = '917061285806'
const WA_MSG = encodeURIComponent('Hi Edify! I want free counselling for online education.')

export default function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6 flex items-center justify-center w-13 h-13 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95"
      style={{ background: '#25D366', width: 52, height: 52 }}
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.428.638 4.71 1.752 6.688L2 30l7.52-1.724A13.938 13.938 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 01-5.832-1.594l-.418-.248-4.464 1.022.984-4.352-.272-.43A11.46 11.46 0 014.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.536c-.344-.172-2.04-1.008-2.356-1.122-.316-.114-.546-.172-.776.172-.23.344-.89 1.122-1.09 1.352-.2.23-.4.258-.744.086-.344-.172-1.452-.536-2.766-1.706-1.022-.91-1.712-2.034-1.912-2.378-.2-.344-.022-.53.15-.7.156-.154.344-.4.516-.6.172-.2.23-.344.344-.574.114-.23.058-.43-.028-.602-.086-.172-.776-1.872-1.064-2.562-.28-.674-.566-.582-.776-.594l-.66-.012c-.23 0-.602.086-.918.43s-1.204 1.178-1.204 2.872 1.232 3.33 1.404 3.56c.172.23 2.426 3.71 5.878 5.204.822.354 1.464.566 1.964.724.824.262 1.574.226 2.168.138.66-.1 2.04-.834 2.328-1.638.288-.804.288-1.492.2-1.638-.086-.144-.316-.23-.66-.4z"/>
      </svg>
    </a>
  )
}
