import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Modal, 
  Spinner, 
  Badge, 
  Card, 
  ProgressBar, 
  Toast, 
  Alert 
} from '../components/common';

const ComponentsTestPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(30);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleLoadingToggle = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>Common Components Test</h1>

      {/* Buttons */}
      <section>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => showToast('info', 'Primary Button Clicked')}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" isLoading={true}>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2>Inputs</h2>
        <div style={{ maxWidth: '400px' }}>
          <Input label="Default Input" placeholder="Type something..." />
          <Input label="Error Input" placeholder="Error state" error="This field is required" />
          <Input label="Full Width" fullWidth placeholder="Full width input" />
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2>Badges</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Badge variant="info">Info</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="up">Stock Up</Badge>
          <Badge variant="down">Stock Down</Badge>
        </div>
      </section>

      {/* Spinners */}
      <section>
        <h2>Spinners</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </section>

      {/* Progress Bar */}
      <section>
        <h2>Progress Bar</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <ProgressBar value={progress} showLabel />
          <Button size="sm" onClick={() => setProgress(p => (p + 10) % 110)}>Increase Progress</Button>
          <ProgressBar value={75} color="success" height="sm" />
          <ProgressBar value={50} color="warning" />
          <ProgressBar value={90} color="danger" />
          <ProgressBar value={20} color="exp" />
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h2>Alerts</h2>
        <div style={{ maxWidth: '600px' }}>
          <Alert type="info" title="Information">This is an info alert.</Alert>
          <Alert type="success">Operation completed successfully!</Alert>
          <Alert type="warning" title="Warning">Please check your inputs.</Alert>
          <Alert type="error" title="Error">Something went wrong.</Alert>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2>Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          <Card>
            <h3>Default Padding</h3>
            <p>This is a card with default padding.</p>
          </Card>
          <Card padding="lg">
            <h3>Large Padding</h3>
            <p>This is a card with large padding.</p>
          </Card>
          <Card padding="none">
            <div style={{ padding: '1rem', backgroundColor: '#eee' }}>
              <h3>No Padding wrapper</h3>
            </div>
            <div style={{ padding: '1rem' }}>
              <p>Content below</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Modals & Toasts */}
      <section>
        <h2>Overlays</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Button onClick={() => showToast('success', 'Operation Successful!')}>Show Success Toast</Button>
          <Button onClick={() => showToast('error', 'Operation Failed!')}>Show Error Toast</Button>
        </div>
      </section>

      {/* Modal Instance */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Example Modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p>This is the modal content. You can put anything here.</p>
        <Input label="Modal Input" placeholder="Type inside modal" />
      </Modal>

      {/* Toast Instance */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 2000 }}>
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
    </div>
  );
};

export default ComponentsTestPage;
