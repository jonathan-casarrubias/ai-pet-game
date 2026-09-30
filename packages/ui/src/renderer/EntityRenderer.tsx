import React from 'react';
import {
  BlurMask,
  Circle,
  Group,
  Path,
  RadialGradient,
  RoundedRect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import type { SceneEntity } from '../presentation/presentation-model';

type EntityRendererProps = {
  entity: SceneEntity;
  x: number;
  y: number;
};

export const EntityRenderer: React.FC<EntityRendererProps> = ({ entity, x, y }) => {
  const isThreat = entity.role === 'threat';
  const isHelper = entity.role === 'helper';
  const isHazard = entity.type === 'hazard';
  const isCreature = entity.type === 'creature';
  const isDiscovered = entity.state === 'discovered';
  const isEscaped = entity.isEscapedThreat || entity.state === 'escaped';
  const shouldGlow = entity.state === 'glowing' || entity.isNearby;

  const colors = isEscaped
    ? ['#c4c9a8', '#747b68']
    : isThreat
      ? ['#ffb17a', '#d45342']
      : isHelper
        ? ['#c4f1d1', '#42a68c']
        : isHazard
          ? ['#ffd187', '#d36c48']
          : isCreature
            ? ['#c3e7b2', '#57966c']
            : ['#ffe9a5', '#c7824d'];
  const glowColor = isThreat ? 'rgba(231, 92, 68, 0.35)' : 'rgba(255, 224, 143, 0.38)';

  const silhouette = Skia.Path.Make();
  if (isHazard) {
    silhouette.moveTo(x, y - 31);
    silhouette.lineTo(x + 25, y + 20);
    silhouette.lineTo(x - 25, y + 20);
    silhouette.close();
  } else {
    silhouette.moveTo(x - 22, y + 4);
    silhouette.cubicTo(x - 28, y - 14, x - 9, y - 26, x, y - 17);
    silhouette.cubicTo(x + 16, y - 29, x + 30, y - 9, x + 20, y + 7);
    silhouette.cubicTo(x + 17, y + 25, x - 15, y + 28, x - 22, y + 4);
    silhouette.close();
  }
  const hazardMark = Skia.Path.Make();
  hazardMark.moveTo(x - 12, y + 12);
  hazardMark.lineTo(x, y - 11);
  hazardMark.lineTo(x + 12, y + 12);

  return (
    <Group opacity={isEscaped ? 0.55 : 1}>
      <Circle cx={x} cy={y + 27} r={27} color="rgba(37, 55, 38, 0.28)" />

      {shouldGlow && (
        <Circle cx={x} cy={y} r={48}>
          <RadialGradient
            c={vec(x, y)}
            r={48}
            colors={[glowColor, 'rgba(255, 224, 143, 0)']}
          />
          <BlurMask blur={12} style="normal" />
        </Circle>
      )}

      {isCreature ? (
        <Group>
          <Path path={silhouette}>
            <RadialGradient c={vec(x - 7, y - 10)} r={43} colors={colors} />
          </Path>
          <Circle cx={x - 8} cy={y - 1} r={3.3} color="#273c39" />
          <Circle cx={x + 8} cy={y - 1} r={3.3} color="#273c39" />
          <Circle cx={x - 7} cy={y - 2} r={1.1} color="#ffffff" />
          <Circle cx={x + 9} cy={y - 2} r={1.1} color="#ffffff" />
        </Group>
      ) : isHazard ? (
        <Group>
          <Path path={silhouette}>
            <RadialGradient c={vec(x - 5, y - 14)} r={38} colors={colors} />
          </Path>
          <Path
            path={hazardMark}
            color="rgba(255, 244, 206, 0.76)"
            style="stroke"
            strokeWidth={3}
            strokeCap="round"
            strokeJoin="round"
          />
        </Group>
      ) : (
        <Group>
          <RoundedRect x={x - 24} y={y - 20} width={48} height={43} r={16}>
            <RadialGradient c={vec(x - 8, y - 10)} r={42} colors={colors} />
          </RoundedRect>
          <Path path={silhouette} color="rgba(255, 255, 255, 0.28)" />
        </Group>
      )}

      {entity.isNearby && !isEscaped && (
        <Circle
          cx={x}
          cy={y}
          r={36}
          color={isThreat ? '#d45342' : '#fff0b8'}
          style="stroke"
          strokeWidth={2}
          opacity={0.9}
        />
      )}

      {isDiscovered && (
        <Circle cx={x + 25} cy={y - 25} r={5} color="#fff1ab" />
      )}
    </Group>
  );
};