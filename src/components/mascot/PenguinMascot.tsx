import React, { useEffect } from 'react';
import { Pressable, View, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    ZoomIn,
    FadeIn,
    FadeOut,
    runOnJS,
} from 'react-native-reanimated';
import { mascotAssets, MascotMood } from '../../constants/mascotAssets';
import { useAppStore } from '../../store/useAppStore';

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PenguinMascotProps {
    mood?: MascotMood; // Optional prop to override store
    size?: number;
    onPress?: () => void;
}

export function PenguinMascot({ mood: propMood, size = 200, onPress }: PenguinMascotProps) {
    const storeMood = useAppStore((state) => state.mascotMood);
    // Prop takes precedence over store, useful for static displays (e.g. Paywall)
    const currentMood = propMood || storeMood;

    // Animation values
    const scale = useSharedValue(1);
    const translateY = useSharedValue(0);

    const handlePress = () => {
        // Bounce animation
        translateY.value = withSequence(
            withSpring(-20, { damping: 10 }), // Jump up
            withSpring(0, { damping: 10 })   // Land
        );
        scale.value = withSequence(
            withTiming(0.9, { duration: 50 }),
            withSpring(1)
        );

        // Haptics/Confetti triggers could go here
        if (onPress) onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value }
        ],
    }));

    return (
        <Pressable onPress={handlePress}>
            <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
                {/* Key changes trigger enter/exit layout animations for smooth cross-fade */}
                <AnimatedImage
                    key={currentMood}
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    source={mascotAssets[currentMood] || mascotAssets.idle}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                />
            </Animated.View>
        </Pressable>
    );
}
