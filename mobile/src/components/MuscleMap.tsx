import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { colors } from '../theme';

interface MuscleMapProps {
  activeGroups?: string[];
  width?: number;
  height?: number;
}

const muscleGroupPaths: Record<string, { d?: string; cx?: number; cy?: number }> = {
  peito: { cx: 100, cy: 65 },
  costas: { cx: 100, cy: 70 },
  ombro: { cx: 72, cy: 50 },
  biceps: { cx: 60, cy: 82 },
  triceps: { cx: 140, cy: 82 },
  antebraco: { cx: 52, cy: 105 },
  abdomen: { cx: 100, cy: 95 },
  obliquo: { cx: 80, cy: 90 },
  quadriceps: { cx: 85, cy: 140 },
  posterior: { cx: 115, cy: 138 },
  gluteo: { cx: 100, cy: 120 },
  panturrilha: { cx: 90, cy: 175 },
  trapezio: { cx: 100, cy: 42 },
  dorsal: { cx: 100, cy: 78 },
  lombar: { cx: 100, cy: 105 },
  adutor: { cx: 100, cy: 148 },
};

export const MuscleMap: React.FC<MuscleMapProps> = ({
  activeGroups = [],
  width = 200,
  height = 220,
}) => {
  const normalizedActive = activeGroups.map((g) => g.toLowerCase().replace(/\s/g, ''));

  const isActive = (group: string) =>
    normalizedActive.some(
      (a) =>
        a.includes(group) ||
        group.includes(a) ||
        a === group
    );

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox="0 0 200 220">
        {/* Body silhouette */}
        <G opacity={0.3}>
          {/* Head */}
          <Circle cx="100" cy="20" r="14" fill={colors.textTertiary} />
          {/* Neck */}
          <Path d="M94 34 L106 34 L106 40 L94 40 Z" fill={colors.textTertiary} />
          {/* Torso */}
          <Path
            d="M70 40 L130 40 L135 50 L138 70 L135 100 L128 120 L72 120 L65 100 L62 70 L65 50 Z"
            fill={colors.textTertiary}
          />
          {/* Left arm */}
          <Path
            d="M65 50 L55 48 L48 60 L42 80 L38 100 L42 115 L48 110 L52 95 L55 80 L62 65 Z"
            fill={colors.textTertiary}
          />
          {/* Right arm */}
          <Path
            d="M135 50 L145 48 L152 60 L158 80 L162 100 L158 115 L152 110 L148 95 L145 80 L138 65 Z"
            fill={colors.textTertiary}
          />
          {/* Left leg */}
          <Path
            d="M72 120 L68 125 L65 145 L62 165 L60 185 L65 200 L72 200 L75 185 L78 165 L82 145 L85 125 Z"
            fill={colors.textTertiary}
          />
          {/* Right leg */}
          <Path
            d="M128 120 L132 125 L135 145 L138 165 L140 185 L135 200 L128 200 L125 185 L122 165 L118 145 L115 125 Z"
            fill={colors.textTertiary}
          />
        </G>

        {/* Active muscle highlights */}
        {Object.entries(muscleGroupPaths).map(([group, pos]) => {
          if (!isActive(group) || !pos.cx || !pos.cy) return null;
          return (
            <G key={group}>
              <Circle
                cx={pos.cx}
                cy={pos.cy}
                r={14}
                fill={colors.error}
                opacity={0.5}
              />
              <Circle
                cx={pos.cx}
                cy={pos.cy}
                r={8}
                fill={colors.error}
                opacity={0.8}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
