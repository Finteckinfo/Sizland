import React from 'react';
import { gsap } from 'gsap';

interface FlowingMenuItem {
  link: string;
  text: string;
  image?: string;
}

interface FlowingMenuProps {
  items: FlowingMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onScrollToSection?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>, href: string) => void;
}

function FlowingMenu({ items = [], isOpen, onClose, onScrollToSection }: FlowingMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="flowing-menu-overlay" onClick={onClose}>
      <div className="flowing-menu-container" onClick={(e) => e.stopPropagation()}>
        <button 
          className="flowing-menu-close" 
          onClick={onClose}
          aria-label="Close menu"
          title="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <nav className="flowing-menu">
          {items.map((item, idx) => (
            <MenuItem key={idx} {...item} onScrollToSection={onScrollToSection} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function MenuItem({ link, text, image, onScrollToSection }: FlowingMenuItem & { onScrollToSection?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>, href: string) => void }) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const marqueeRef = React.useRef<HTMLDivElement>(null);
  const marqueeInnerRef = React.useRef<HTMLDivElement>(null);

  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const findClosestEdge = (mouseX: number, mouseY: number, width: number, height: number) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const distMetric = (x: number, y: number, x2: number, y2: number) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  const handleMouseEnter = (ev: React.MouseEvent) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap.timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap.timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  const repeatedMarqueeContent = Array.from({ length: 4 }).map((_, idx) => (
    <React.Fragment key={idx}>
      <span>{text}</span>
      {image && (
        <div
          className="marquee__img"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
    </React.Fragment>
  ));

  return (
    <div className="flowing-menu__item" ref={itemRef}>
      <a
        className="flowing-menu__item-link"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          if (onScrollToSection && link.startsWith('#')) {
            e.preventDefault();
            onScrollToSection(e, link);
          }
        }}
      >
        {text}
      </a>
      <div className="flowing-marquee" ref={marqueeRef}>
        <div className="flowing-marquee__inner-wrap" ref={marqueeInnerRef}>
          <div className="flowing-marquee__inner" aria-hidden="true">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
