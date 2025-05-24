import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface InputProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
}

const Input: React.FC<InputProps> = ({ value, placeholder, onChangeText, onBlur }) => {
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    backgroundColor: 'white',
  },
});

export default Input;
