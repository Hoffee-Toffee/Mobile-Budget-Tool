This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## Migration Checklist: Web React Budget Tool → React Native Version

This checklist covers all major features, components, and utilities from the original web React version that should be implemented or adapted in your React Native version. Items already completed in your codebase are checked off.

### Core App Structure

- [x] **App entry point** (`App.tsx`)
- [x] **Theme provider/context** (`ThemeProvider`, `theme`, `useTheme`)
- [x] **BudgetTool main component**
- [x] **Local state for title, theme, etc.**
- [x] **Persistent storage for budget data** (AsyncStorage)
- [x] **Loading indicator when data is not ready**

### Components

- [x] **Input component** (custom, in `Shared/Input.tsx`)
- [x] **Button component** (custom, in `Shared/Button.tsx`)
- [ ] Section headers (e.g., Income, Important, Voluntary)
- [ ] Expand/collapse for budget items (if needed)
- [ ] Editable item rows (name, value, etc.)
- [ ] Add/delete item buttons
- [ ] Dark mode toggle (UI control)
- [ ] Currency selector (if supporting multiple currencies)

### Utilities / Functions

- [x] **Currency formatting** (`formatCurrency` in `utils/formatters.ts`)
- [x] **Summary calculation** (`calculateSummary` in `utils/calculations.ts`)
- [ ] Calculation for each item (if supporting formulas/expressions)
- [ ] Copy/share/export/import budget data
- [ ] Print/PDF export (if needed for mobile)

### State & Data

- [x] **useBudgetData custom hook** (with AsyncStorage)
- [x] **Initial data structure** (settings, income, important, voluntary)
- [x] **Sync local state with loaded data**
- [ ] Save changes to AsyncStorage on edit
- [ ] Support for expanded/collapsed state per item (if needed)

### UI/UX

- [x] **Loading state**
- [ ] Responsive layout for different device sizes
- [ ] Accessibility (labels, roles, etc.)
- [ ] Error handling and user feedback

### Other Features (from original web version)

- [ ] Print styles (not directly applicable, but consider share/export)
- [ ] Keyboard shortcuts (if needed)
- [ ] Tooltips/help text

---

**Legend:**

- [x] = Already implemented in your React Native codebase
- [ ] = Still to be implemented or adapted

Update this checklist as you migrate or add features!
