import React, { useRef } from 'react';
import {
  BlurMask,
  Canvas,
  Circle,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import {
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { EntityRenderer } from './EntityRenderer';
import { PetRenderer } from './PetRenderer';
import type { PresentationModel } from '../presentation/presentation-model';

type GameWorldRendererProps = {
  presentation: PresentationModel;
  onMove: (direction: 'up' | 'down') => void;
  onSelectEntity: (entityId: string) => void;
  width?: number;
  height?: number;
};

const DEFAULT_WIDTH = Dimensions.get('window').width || 390;
const DEFAULT_HEIGHT = 440;

export const GameWorldRenderer: React.FC<GameWorldRendererProps> = ({
  presentation,
  onMove,
  onSelectEntity,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  const touchStartY = useRef<number | null>(null);
  const ignoreNextPress = useRef(false);
  const playerX = width * 0.5;
  const playerY = height * 0.67;
  const scale = Math.min(width / 260, height / 250);
  const depth = presentation.worldBounds.maxY - presentation.playerPosition.y;
  const pathSway = Math.sin(depth * 0.018) * width * 0.025;

  const trailPath = Skia.Path.Make();
  trailPath.moveTo(width * 0.47 + pathSway * 0.2, height * 0.22);
  trailPath.cubicTo(
    width * 0.42 + pathSway,
    height * 0.48,
    width * 0.60 + pathSway,
    height * 0.66,
    width * 0.79 + pathSway * 0.3,
    height,
  );
  trailPath.lineTo(width * 0.20 + pathSway * 0.3, height);
  trailPath.cubicTo(
    width * 0.41 + pathSway,
    height * 0.66,
    width * 0.34 + pathSway,
    height * 0.46,
    width * 0.47 + pathSway * 0.2,
    height * 0.22,
  );
  trailPath.close();

  const trailEdge = Skia.Path.Make();
  trailEdge.moveTo(width * 0.47 + pathSway * 0.2, height * 0.22);
  trailEdge.cubicTo(
    width * 0.42 + pathSway,
    height * 0.48,
    width * 0.60 + pathSway,
    height * 0.66,
    width * 0.79 + pathSway * 0.3,
    height,
  );

  const foliage = Array.from({ length: 9 }, (_, index) => {
    const range = height + 150;
    const rawY = index * 112 + depth * 0.72;
    const y = ((rawY % range) + range) % range - 75;
    const inset = (index % 3) * width * 0.025;
    return { y, leftX: width * 0.06 + inset, rightX: width * 0.94 - inset };
  });

  const positionedEntities = presentation.entities.map((entity) => ({
    entity,
    x: playerX + (entity.position.x - presentation.playerPosition.x) * scale,
    y: playerY + (entity.position.y - presentation.playerPosition.y) * scale,
  }));

  const handleTouchStart = (event: GestureResponderEvent) => {
    touchStartY.current = event.nativeEvent.pageY;
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = event.nativeEvent.pageY - touchStartY.current;
    touchStartY.current = null;
    if (Math.abs(deltaY) < 42) return;
    ignoreNextPress.current = true;
    onMove(deltaY < 0 ? 'up' : 'down');
    setTimeout(() => {
      ignoreNextPress.current = false;
    }, 250);
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (
      touchStartY.current !== null &&
      Math.abs(event.nativeEvent.pageY - touchStartY.current) > 10
    ) {
      event.preventDefault();
    }
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (ignoreNextPress.current) {
      ignoreNextPress.current = false;
      return;
    }
    const { locationX, locationY } = event.nativeEvent;
    let closest: (typeof positionedEntities)[number] | undefined;
    let closestDistance = 48;
    for (const candidate of positionedEntities) {
      const distance = Math.hypot(locationX - candidate.x, locationY - candidate.y);
      if (distance < closestDistance) {
        closest = candidate;
        closestDistance = distance;
      }
    }
    if (closest) onSelectEntity(closest.entity.id);
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View
        style={[styles.container, { width, height }]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Canvas style={{ width, height }}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={['#b9d7bb', '#8bb58c', '#587f61', '#315d49']}
            />
          </Rect>

          <Circle cx={width * 0.55} cy={height * 0.18} r={width * 0.34}>
            <RadialGradient
              c={vec(width * 0.55, height * 0.18)}
              r={width * 0.34}
              colors={['rgba(255, 238, 183, 0.76)', 'rgba(255, 238, 183, 0)']}
            />
            <BlurMask blur={18} style="normal" />
          </Circle>

          {foliage.map((leaf, index) => (
            <React.Fragment key={index}>
              <Circle
                cx={leaf.leftX}
                cy={leaf.y}
                r={34 + (index % 3) * 9}
                color={index % 2 === 0 ? '#397051' : '#4c815a'}
                opacity={0.78}
              />
              <Circle
                cx={leaf.rightX}
                cy={leaf.y + 38}
                r={38 + (index % 2) * 10}
                color={index % 2 === 0 ? '#32694d' : '#5a8758'}
                opacity={0.76}
              />
            </React.Fragment>
          ))}

          <Path path={trailPath}>
            <LinearGradient
              start={vec(width * 0.5, height * 0.2)}
              end={vec(width * 0.5, height)}
              colors={['#d8c798', '#bca477', '#937451']}
            />
          </Path>
          <Path
            path={trailEdge}
            color="rgba(244, 224, 174, 0.55)"
            style="stroke"
            strokeWidth={3}
          />

          {positionedEntities
            .filter(({ y }) => y > -60 && y < height + 60)
            .map(({ entity, x, y }) => (
              <EntityRenderer key={entity.id} entity={entity} x={x} y={y} />
            ))}

          <PetRenderer
            x={playerX}
            y={playerY}
            visualState={presentation.petVisualState}
            name={presentation.petName}
          />
        </Canvas>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#72956e',
  },
});