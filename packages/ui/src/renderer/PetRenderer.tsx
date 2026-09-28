import React, { useState, useEffect } from 'react';
import {
  Group,
  Circle,
  Path,
  RadialGradient,
  BlurMask,
  vec,
  Skia,
} from '@shopify/react-native-skia';
import type { PetVisualState } from '../presentation/presentation-model';

type PetRendererProps = {
  x: number;
  y: number;
  visualState: PetVisualState;
  name: string;
};

export const PetRenderer: React.FC<PetRendererProps> = ({ x, y, visualState }) => {
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

  let speed = 0.003;
  let bounceHeight = 8;
  let auraRadiusBase = 65;

  if (visualState === 'excited' || visualState === 'celebrating') {
    speed = 0.008;
    bounceHeight = 18;
    auraRadiusBase = 75;
  } else if (visualState === 'curious') {
    speed = 0.005;
    bounceHeight = 12;
    auraRadiusBase = 70;
  } else if (visualState === 'happy') {
    speed = 0.004;
    bounceHeight = 10;
    auraRadiusBase = 68;
  }

  const floatY = y - Math.abs(Math.sin(frame * speed)) * bounceHeight;
  const auraRadius = auraRadiusBase + Math.sin(frame * speed * 1.5) * 6;
  const scale = 1 + Math.sin(frame * speed * 2) * 0.04;

  let auraColorStart = '#c084fc';
  let auraColorEnd = 'rgba(192, 132, 252, 0)';
  let bodyColorStart = '#e9d5ff';
  let bodyColorEnd = '#a855f7';

  if (visualState === 'excited' || visualState === 'celebrating') {
    auraColorStart = '#fde047';
    auraColorEnd = 'rgba(253, 224, 71, 0)';
    bodyColorStart = '#fef08a';
    bodyColorEnd = '#eab308';
  } else if (visualState === 'curious') {
    auraColorStart = '#38bdf8';
    auraColorEnd = 'rgba(56, 189, 248, 0)';
    bodyColorStart = '#bae6fd';
    bodyColorEnd = '#0284c7';
  } else if (visualState === 'happy') {
    auraColorStart = '#4ade80';
    auraColorEnd = 'rgba(74, 222, 128, 0)';
    bodyColorStart = '#bbf7d0';
    bodyColorEnd = '#16a34a';
  }

  const leftEarPath = Skia.Path.Make();
  leftEarPath.moveTo(x - 30, floatY - 10);
  leftEarPath.lineTo(x - 42, floatY - 52);
  leftEarPath.lineTo(x - 10, floatY - 30);
  leftEarPath.close();

  const rightEarPath = Skia.Path.Make();
  rightEarPath.moveTo(x + 30, floatY - 10);
  rightEarPath.lineTo(x + 42, floatY - 52);
  rightEarPath.lineTo(x + 10, floatY - 30);
  rightEarPath.close();

  const leftInnerEar = Skia.Path.Make();
  leftInnerEar.moveTo(x - 26, floatY - 14);
  leftInnerEar.lineTo(x - 36, floatY - 44);
  leftInnerEar.lineTo(x - 14, floatY - 28);
  leftInnerEar.close();

  const rightInnerEar = Skia.Path.Make();
  rightInnerEar.moveTo(x + 26, floatY - 14);
  rightInnerEar.lineTo(x + 36, floatY - 44);
  rightInnerEar.lineTo(x + 14, floatY - 28);
  rightInnerEar.close();

  const tailPath = Skia.Path.Make();
  tailPath.moveTo(x + 30, floatY + 15);
  tailPath.cubicTo(
    x + 60,
    floatY + 25 + Math.sin(frame * speed * 2) * 8,
    x + 65,
    floatY - 20,
    x + 50,
    floatY - 35,
  );

  return (
    <Group>
      <Circle cx={x} cy={floatY} r={auraRadius}>
        <RadialGradient
          c={vec(x, floatY)}
          r={auraRadius}
          colors={[auraColorStart, auraColorEnd]}
        />
        <BlurMask blur={15} style="normal" />
      </Circle>

      <Circle cx={x} cy={y + 48} r={32}>
        <RadialGradient
          c={vec(x, y + 48)}
          r={32}
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
        />
      </Circle>

      <Group
        transform={[
          { translateX: x },
          { translateY: floatY },
          { scale },
          { translateX: -x },
          { translateY: -floatY },
        ]}
      >
        <Path
          path={tailPath}
          color={bodyColorEnd}
          style="stroke"
          strokeWidth={8}
          strokeCap="round"
        />

        <Path path={leftEarPath} color={bodyColorEnd} />
        <Path path={rightEarPath} color={bodyColorEnd} />

        <Path path={leftInnerEar} color="#f472b6" />
        <Path path={rightInnerEar} color="#f472b6" />

        <Circle cx={x} cy={floatY} r={38}>
          <RadialGradient
            c={vec(x - 10, floatY - 15)}
            r={48}
            colors={[bodyColorStart, bodyColorEnd]}
          />
        </Circle>

        <Circle cx={x - 20} cy={floatY + 8} r={6.5} color="#f472b6" opacity={0.7} />
        <Circle cx={x + 20} cy={floatY + 8} r={6.5} color="#f472b6" opacity={0.7} />

        <Circle cx={x - 13} cy={floatY - 5} r={6} color="#1e1b4b" />
        <Circle cx={x + 13} cy={floatY - 5} r={6} color="#1e1b4b" />

        <Circle cx={x - 11} cy={floatY - 8} r={2.2} color="#ffffff" />
        <Circle cx={x + 15} cy={floatY - 8} r={2.2} color="#ffffff" />

        <Circle cx={x} cy={floatY + 3} r={2.8} color="#f472b6" />
      </Group>
    </Group>
  );
};
