import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';

interface InputProps {
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
}

const Input: React.FC<InputProps> = ({ value, placeholder, onChangeText }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
});

export default Input;