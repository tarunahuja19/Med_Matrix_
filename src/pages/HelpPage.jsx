import { useState } from 'react'
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail, 
  ChevronDown, 
  ChevronRight,
  FileText,
  Video,
  Users,
  ExternalLink
} from 'lucide-react'

const faqs = [
  {
    question: 'What file formats are supported?',
    answer: 'NeuroScan AI supports K-space data files (.dat, .h5, .hdf5, .raw) and standard MRI image formats including DICOM (.dcm), NIfTI (.nii, .nii.gz), and MetaImage (.mha).'
  },
  {
    question: 'How does the microbleed detection work?',
    answer: 'Our Mamba-2 based model analyzes K-space data directly to detect subtle microbleeds that may be difficult to identify in reconstructed MRI images. The model uses position clustering, size analysis, and pattern recognition to identify and classify potential bleeds.'
  },
  {
    question: 'What is disease progression prediction?',
    answer: 'Based on the detected anomalies, their positions, sizes, and clustering patterns, our model can predict potential future affected regions. This helps in early intervention and treatment planning.'
  },
  {
    question: 'How accurate is the detection model?',
    answer: 'The Mamba-2 architecture achieves high sensitivity in detecting microbleeds and other anomalies. However, all results should be verified by qualified medical professionals before making clinical decisions.'
  },
  {
    question: 'Can I export the analysis results?',
    answer: 'Yes, you can export results in multiple formats including PDF reports, CSV data files, and 3D visualization files. Use the export option in the Analysis page after running detection.'
  },
  {
    question: 'What are the system requirements?',
    answer: 'For optimal performance, we recommend a system with at least 16GB RAM, a modern GPU with 4GB+ VRAM, and an SSD for faster data loading. The application runs on Windows, macOS, and Linux.'
  }
]

const resources = [
  { icon: Book, title: 'Documentation', description: 'Complete user guide and API reference', link: '#' },
  { icon: Video, title: 'Video Tutorials', description: 'Step-by-step walkthrough videos', link: '#' },
  { icon: FileText, title: 'Research Paper', description: 'Technical details of Mamba-2 model', link: '#' },
  { icon: Users, title: 'Community Forum', description: 'Connect with other users', link: '#' },
]

function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="page-transition p-8 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Help & Support</h1>
          <p className="text-text-secondary">
            Find answers to common questions and get support
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Live Chat Support</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Get instant help from our support team
                </p>
                <button className="text-sm text-primary font-medium hover:underline">
                  Start Chat
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">Email Support</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Send us a detailed inquiry
                </p>
                <a href="mailto:support@neuroscan.ai" className="text-sm text-primary font-medium hover:underline">
                  support@neuroscan.ai
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.link}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-surface-hover transition-all group"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <resource.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-text-muted">{resource.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-hover transition-colors"
                >
                  <span className="font-medium text-text-primary">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-text-muted flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-text-secondary leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Open Import</span>
              <kbd className="px-2 py-1 bg-surface-hover border border-border rounded text-sm font-mono text-text-primary">Ctrl + I</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Run Analysis</span>
              <kbd className="px-2 py-1 bg-surface-hover border border-border rounded text-sm font-mono text-text-primary">Ctrl + R</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Toggle 3D View</span>
              <kbd className="px-2 py-1 bg-surface-hover border border-border rounded text-sm font-mono text-text-primary">Ctrl + 3</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Export Results</span>
              <kbd className="px-2 py-1 bg-surface-hover border border-border rounded text-sm font-mono text-text-primary">Ctrl + E</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Open Settings</span>
              <kbd className="px-2 py-1 bg-surface-hover border border-border rounded text-sm font-mono text-text-primary">Ctrl + ,</kbd>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Toggle Fullscreen</span>
              <kbd className="px-2 py-1 bg-surface-hover border border-border rounded text-sm font-mono text-text-primary">F11</kbd>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-8 text-center text-sm text-text-muted">
          <p>NeuroScan AI v1.0.0 | Mamba-2 Model v1.0.0</p>
          <p className="mt-1">Built for Medical Imaging Hackathon 2024</p>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
