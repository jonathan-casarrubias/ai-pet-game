import React from 'react';
import {
  Canvas,
  Rect,
  Circle,
  LinearGradient,
  RadialGradient,
  BlurMask,
  Path,
  vec,
  Skia,
} from '@shopify/react-native-skia';
import { StyleSheet, View, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { PetRenderer } from './PetRenderer';
import { ObjectRenderer } from './ObjectRenderer';
import type { PresentationModel } from '../presentation/presentation-model';

type GameWorldRendererProps = {
  presentation: PresentationModel;
  onSelectPet?: () => void;
  onSelectObject?: (objectId: string) => void;
  width?: number;
  height?: number;
};

const DEFAULT_WIDTH = Dimensions.get('window').width || 390;
const DEFAULT_HEIGHT = 380;

const STARS = [
  { x: 30, y: 35, r: 1.5 },
  { x: 90, y: 60, r: 2.2 },
  { x: 150, y: 25, r: 1.2 },
  { x: 210, y: 75, r: 2.0 },
  { x: 280, y: 40, r: 1.8 },
  { x: 340, y: 85, r: 2.5 },
  { x: 60, y: 120, r: 1.6 },
  { x: 180, y: 110, r: 2.0 },
  { x: 310, y: 130, r: 1.4 },
];

export const GameWorldRenderer: React.FC<GameWorldRendererProps> = ({
  presentation,
  onSelectPet,
  onSelectObject,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  const petX = width * 0.35;
  const petY = height * 0.55;

  const stoneX = width * 0.72;
  const stoneY = height * 0.60;

  const groundPath = Skia.Path.Make();
  groundPath.moveTo(0, height * 0.50);
  groundPath.cubicTo(
    width * 0.3,
    height * 0.45,
    width * 0.7,
    height * 0.55,
    width,
    height * 0.48,
  );
  groundPath.lineTo(width, height);
  groundPath.lineTo(0, height);
  groundPath.close();

  const handleTouch = (evt: { nativeEvent: { locationX: number; locationY: number } }) => {
    const { locationX, locationY } = evt.nativeEvent;

    const distPet = Math.hypot(locationX - petX, locationY - petY);
    if (distPet <= 55) {
      onSelectPet?.();
      return;
    }

    const distStone = Math.hypot(locationX - stoneX, locationY - stoneY);
    if (distStone <= 50) {
      onSelectObject?.('blue-stone');
      return;
    }
  };

  const blueStoneObject = presentation.objects.find((o) => o.id === 'blue-stone');

  return (
    <TouchableWithoutFeedback onPress={handleTouch}>
      <View style={[styles.container, { width, height }]}>
        <Canvas style={{ width, height }}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={['#090514', '#150d2a', '#241442']}
            />
          </Rect>

          <Circle cx={width * 0.85} cy={60} r={28}>
            <RadialGradient
              c={vec(width * 0.85 - 5, 55)}
              r={30}
              colors={['#fffbeb', '#fde68a']}
            />
          </Circle>
          <Circle cx={width * 0.85} cy={60} r={40}>
            <RadialGradient
              c={vec(width * 0.85, 60)}
              r={40}
              colors={['rgba(253, 230, 138, 0.3)', 'rgba(253, 230, 138, 0)']}
            />
            <BlurMask blur={10} style="normal" />
          </Circle>

          {STARS.map((star, idx) => (
            <Circle
              key={idx}
              cx={(star.x / 390) * width}
              cy={(star.y / 380) * height}
              r={star.r}
              color="#ffffff"
              opacity={0.85}
            />
          ))}

          <Path path={groundPath}>
            <LinearGradient
              start={vec(0, height * 0.45)}
              end={vec(0, height)}
              colors={['#166534', '#14532d', '#052e16']}
            />
          </Path>

          <PetRenderer
            x={petX}
            y={petY}
            visualState={presentation.petVisualState}
            name={presentation.petName}
          />

          {blueStoneObject && (
            <ObjectRenderer
              id={blueStoneObject.id}
              label={blueStoneObject.label}
              x={stoneX}
              y={stoneY}
              visualState={blueStoneObject.visualState}
            />
          )}
        </Canvas>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#090514',
  },
});
