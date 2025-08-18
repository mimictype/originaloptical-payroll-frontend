import React from 'react';
import './Section.css';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className }) => (
  <div className={className ? className : 'payroll-section'}>
    <h4 className="section-title">{title}</h4>
    {children}
  </div>
);

export default Section;
