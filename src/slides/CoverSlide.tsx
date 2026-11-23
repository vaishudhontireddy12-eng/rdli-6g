import { useCallback, useMemo } from 'react';
import {
  PAPER_AUTHOR_H,
  PAPER_AUTHOR_W,
  ThreeDPaper,
} from '../components/threeui/ThreeDPaper';
import { drawCoverSheetTexture } from './coverTexture';

export interface SlideRenderProps {
  isActive?: boolean;
  turnOffset?: number;
}

export function CoverSlide({ isActive = true }: SlideRenderProps) {
  const fontLoads = useMemo(
    () => [
      '600 94px "Playfair Display"',
      '600 22px "Plus Jakarta Sans"',
      '400 30px "Plus Jakarta Sans"',
      '500 25px "Plus Jakarta Sans"',
    ],
    [],
  );

  const drawCoverTexture = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number = PAPER_AUTHOR_W,
      h: number = PAPER_AUTHOR_H,
    ) => {
      drawCoverSheetTexture(ctx, w, h);
    },
    [],
  );

  return (
    <div className="relative h-full w-full bg-transparent">
      <ThreeDPaper
        drawContent={drawCoverTexture}
        fontLoads={fontLoads}
        rimColor={0x0284c7}
        rimIntensity={0.34}
        touchLightColor={0x38bdf8}
        isActive={isActive}
        enableDragTurn={false}
      />
    </div>
  );
}
