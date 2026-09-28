import React, { useState, useEffect } from 'react';
import {
  Group,
  Circle,
  Path,
  RoundedRect,
  RadialGradient,
  BlurMask,
  vec,
  Skia,
} from '@shopify/react-native-skia';
import type { ObjectVisualState } from '../presentation/presentation-model';

type ObjectRendererProps = {
  id: string;
  label: string;
  x: number;
  y: number;
  visualState: ObjectVisualState;
};

export const ObjectRenderer: React.FC<ObjectRendererProps> = ({
  x,
  y,
  visualState,
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let animId: number;
    let startTime = Date.now();

    const loop = () => {
      setFrame(Date.now() - startTime);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const isDiscovered = visualState === 'discovered';
  const isGlowing = visualState === 'glowing' || isDiscovered;

  const pulse = Math.sin(frame * 0.004) * 6;
  const floatY = y + Math.sin(frame * 0.002) * 4;
  const auraRadius = (isDiscovered ? 60 : 50) + pulse;

  const auraStart = isDiscovered ? '#38bdf8' : '#60a5fa';
  const auraEnd = 'rgba(56, 189, 248, 0)';
  const stoneStart = isDiscovered ? '#00f2fe' : '#38bdf8';
  const stoneEnd = isDiscovered ? '#4facfe' : '#1d4ed8';

  const crystalFacet = Skia.Path.Make();
  crystalFacet.moveTo(x, floatY - 22);
  crystalFacet.lineTo(x + 18, floatY);
  crystalFacet.lineTo(x, floatY + 22);
  crystalFacet.lineTo(x - 18, floatY);
  crystalFacet.close();

  return (
    <Group>
      <Circle cx={x} cy={y + 34} r={28}>
        <RadialGradient
          c={vec(x, y + 34)}
          r={28}
          colors={['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0)']}
        />
      </Circle>

      {isGlowing && (
        <Circle cx={x} cy={floatY} r={auraRadius}>
          <RadialGradient
            c={vec(x, floatY)}
            r={auraRadius}
            colors={[auraStart, auraEnd]}
          />
          <BlurMask blur={12} style="normal" />
        </Circle>
      )}

      <Group>
        <RoundedRect
          x={x - 26}
          y={floatY - 30}
          width={52}
          height={60}
          r={14}
        >
          <RadialGradient
            c={vec(x - 6, floatY - 10)}
            r={42}
            colors={[stoneStart, stoneEnd]}
          />
        </RoundedRect>

        <Path path={crystalFacet} color="rgba(255, 255, 255, 0.35)" />

        {isDiscovered && (
          <Group>
            <Circle cx={x - 20} cy={floatY - 18} r={3} color="#ffffff" />
            <Circle cx={x + 22} cy={floatY - 12} r={2.5} color="#ffffff" />
            <Circle cx={x + 16} cy={floatY + 18} r={3.2} color="#7dd3fc" />
          </Group>
        )}
      </Group>
    </Group>
  );
};
