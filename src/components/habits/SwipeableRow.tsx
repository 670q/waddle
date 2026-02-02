import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface SwipeableRowProps {
    children: React.ReactNode;
    onSwipe: () => void;
    enabled?: boolean;
}

export function SwipeableRow({ children, onSwipe, enabled = true }: SwipeableRowProps) {
    const renderLeftActions = (_progress: any, dragX: any) => {
        return (
            <View className="justify-center flex-1 bg-green-500 rounded-2xl items-start pl-6 my-1">
                <Text className="text-white font-bold text-lg">Completed!</Text>
            </View>
        );
    };

    if (!enabled) return <View className="mb-3">{children}</View>;

    return (
        <View className="mb-3">
            <Swipeable
                renderLeftActions={renderLeftActions}
                onSwipeableLeftOpen={onSwipe}
            >
                {children}
            </Swipeable>
        </View>
    );
}

// Simple fallback Text component if imports fail (fixed via install)
const Text = require('react-native').Text;
