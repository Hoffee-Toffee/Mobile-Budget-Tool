import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface InputProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({ value, placeholder, onChangeText, onBlur, styles, }) => {
  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        value={value}
        label={placeholder}
        onChangeText={onChangeText}
        onBlur={onBlur}
        style={styles.input}
        theme={{ colors: { placeholder: '#888' } }}
      />
    </View>
  );
};

export default Input;
