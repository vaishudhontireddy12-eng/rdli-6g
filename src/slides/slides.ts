import type { ComponentType } from 'react';
import type { SlideRenderProps } from './CoverSlide';
import { Slide2Intro } from './Slide2Intro';
import { Slide3HarqRlc } from './Slide3HarqRlc';
import { Slide4MathModel } from './Slide4MathModel';
import { Slide5Tcp } from './Slide5Tcp';
import { Slide6Simulation } from './Slide6Simulation';
import { Slide7HarqVsL1 } from './Slide7HarqVsL1';
import { Slide8Results } from './Slide8Results';
import { Slide8Analysis } from './Slide8Analysis';
import { Slide9Conclusion } from './Slide9Conclusion';
import { TOPIC_METADATA } from '../data/paperData';

export interface SlideDefinition {
  id: string;
  title: string;
  Component: ComponentType<SlideRenderProps>;
}

const TOPIC_COMPONENTS: ComponentType<SlideRenderProps>[] = [
  Slide2Intro,
  Slide3HarqRlc,
  Slide4MathModel,
  Slide5Tcp,
  Slide6Simulation,
  Slide7HarqVsL1,
  Slide8Results,
  Slide8Analysis,
  Slide9Conclusion,
];

export const TOPIC_SLIDES: SlideDefinition[] = TOPIC_METADATA.map((meta, index) => ({
  id: meta.id,
  title: meta.title,
  Component: TOPIC_COMPONENTS[index],
}));
