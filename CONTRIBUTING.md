# Contributing to qTest Lite Jira Plugin

#### Table Of Contents

* [Git Commit Messages](#git-commit-messages)
* [JavaScript Style Guide](#javascript-style-guide)
* [Folders and files name convention](#folders-and-files-name-convention)
* [Forge & Custom UI](#forge--custom-ui)
* [Custom UI](#custom-ui)
* [Localization and Strings](#localization-and-strings)
* [Custom UI Logging](#custom-ui-logging)
* [Custom UI Error Handling](#custom-ui-error-handling)
* [Tests Style Guide](#tests-style-guide)

### Git Commit Messages

The commit contains the following structural elements, to communicate intent to the consumers of your library:

* **fix**: a commit of the type `fix` patches a bug in your codebase
* **feat**: a commit of the type `feat` introduces a new feature to the codebase
* types other than `fix:` and `feat:` are allowed, for example `BREAKING_CHANGE:` `build:`, `chore:`, `ci:`, `docs:`
  , `style:`, `refactor:`, `perf:`, `test:`, and others.

More details can be found [here](https://www.conventionalcommits.org/en/v1.0.0/).

### JavaScript Style Guide

All JavaScript code is linted with [Prettier](https://prettier.io/).

* Do **not** use *default* `export` statements:
  ```js
  // Use this:
  export class ClassName {}

  // Instead of:
  export default class ClassName {}
  ```
  This way, when importing, IDE will autocomplete the names.

* Add `index.js` file to allow simple and clean imports:

  Assuming that this is the files structure:
  ```ascii
  files
  ├── file-a.js
  ├── file-b.js
  └── file-c.js
  ```

  This is how you should export:
  ```js
  // index.js example
  export * from 'file-a';
  export * from 'file-b';
  export * from 'file-c';
  
  // To get this:
  import { FileA, FileB, FileC } from 'files';
  
  // Instead of:
  import { FileA } from 'files/file-a';
  import { FileB } from 'files/file-b';
  import { FileC } from 'files/file-c';
  ```

### Folders and files name convention

* Use lower case with dashes for all folders and files
  * File: `storage-service.js`
  * Folder: `admin-page`

### Forge & Custom UI

* Place shared components in `./shared` folder.
* Place sub-components under a parent component.

Like the below:
```ascii
components
├── root-component-d
│   ├── child-component-a
│   │   ├── child-component-b
│   │   ├── child-component-a.component.js
│   │   └──  ...
│   ├──  child component-c
│   ├──  root-component.component.js
│   └──  ...
├──  root-component-e
└──  ...
```

**Components**

CustomUI components can be an `Issue Panel`, `Project Page`, etc. \
This is how they should be created (example below is based on the `Admin Page` component.)

Add a new folder `admin-page` in `static/qtest-lite-components/src` with files:

* `index.js`
  ```jsx
  import React from 'react';
  import ReactDOM from 'react-dom';
  import { AdminPage } from './admin-page.component';

  import '@atlaskit/css-reset';

  ReactDOM.render(
    <React.StrictMode>
      <AdminPage />
    </React.StrictMode>,
  document.getElementById('root'));
  ```

* `admin-page.component.js`
* `admin-page.styles.scss`
* `admin-page.test.js`

Add an entry point for the component in `webpack.config.js`:
```js
const adminPage = Object.assign({}, config, {
    entry: './src/admin-page/index.js',
    output: {
        path: path.resolve(__dirname, 'dist/admin-page'),
        filename: 'assets/js/[name].[contenthash:8].js'
}});

// just an additional example of entry point
const additionalPage = Object.assign({}, config, {
    entry: './src/additional-page/index.js',
    output: {
        path: path.resolve(__dirname, 'dist/additional-page'),
        filename: 'assets/js/[name].[contenthash:8].js'
}});

return [adminPage, additionalPage];
```  

Add the following to `manifest.yml` under `resources`:
```yml
modules:
  jira:adminPage:
    - key: qtest-lite-jira-plugin-admin-page
      resource: adminPage
      ...
resources:
  - key: adminPage
    path: static/qtest-lite-components/dist/admin-page
  - key: ...
    path: ...
```
### Custom UI

* Place shared components in `./static/qtest-lite-components/src/shared`

below is an example of how to create a `MyComponent` component:

```ascii
my-component
├── my-component.component.js   
├── my-component.styles.scss
├── my-component.test.js
└── index.js
```

`component-name.component.js` contents:
```js
// Use "functional components" whenever possible
function ComponentNameInternal() {
    return <div>Text</div>;
}

export const ComponentName = withLogPath(withErrorBoundary(ComponentNameInternal), 'ComponentName');
```

Note the following wrappers & services: 

* Wrap with `withLogPath` to allow bubbling logs from CustomUI to Forge. ([read more](#custom-ui-logging)).
* Wrap with `withErrorBoundary`/`withErrorBoundaryRoot` to handle rendering exceptions. ([read more](#custom-ui-error-handling))
* Use `ExternalCommunicationService` to communicate with Forge API from within CustomUI.

### Atlaskit Typography/fonts design usage

This style file contains mapping of atlaskit typography/fonts. It mostly contains ```font-size``` with ```font-weight```.

How to use:

1. import ```design-styles/design-styles.typography.scss``` on root index.js file.
2. use relevant font class on element on all child components

```js
// For example in project-page/index.js
import '../shared/design-styles/design-styles.typography.scss';

// And then in project-page.component.jsx
<div className="qtest-text-h800">Header title</div>
```

Class list can be found in style itself ```design-styles.typography.scss```.

Class examples:

* ```qtest-text-h100``` ```qtest-text-h200``` ```qtest-text-h300```
* ```qtest-text-h400``` ```qtest-text-h500``` ```qtest-text-h600```
* ```qtest-text-h700``` ```qtest-text-h800``` ```qtest-text-h900```

### Atlaskit Colors design usage

Atlaskit has predefined list of colors.

<b>How to use in styles files (*.scss)</b>:

1. import ```'../shared/design-styles/design-styles-colors'``` in *.scss file.
2. use relevant color in css properties

```
// For example in project-page.styles.scss
@use '../shared/design-styles/design-styles-colors' as colors;

.header-icon {
    fill: colors.$N500;
}
```

<b>How to use in code files (*.js, *.jsx):</b>

1. import ```'shared/design-styles'``` in \*.js/\*.jsx files.
2. use relevant color in code

```jsx
// For example in project-page-test-design.component.jsx
import { N300, N500, R400 } from '../../shared/design-styles';

<FlagFilledIcon size="medium" primaryColor={R400} />
```

Colors list can be found in ```design-styles.code.scss```.

### Common styles usage

This style file contains common classes.

How to use:

1. import ```shared/common-styles/common-styles.scss``` on root index.js file.
2. use relevant font class on element on all child components

```js
// For example in project-page/index.js
import '../shared/common-styles/common-styles.scss';

// And then in child.component.jsx
<div className="qtest-text-ellipsis">Some long text</div>
```

Class list can be found in style itself ```common-styles.scss```.

Class examples:

* ```qtest-text-ellipsis```

### Localization and Strings

* **Forge:** translation file located in `./src/localization`
* **Custom UI:** translation file located in `./static/qtest-lite-components/src/localization`

Use `i18n` to translate:
```js
import i18n from '../shared/localization/i18n';

function SimpleName() {
  return <div>{i18n.t('SOME_STRING_KEY')}</div>;
}
```

### Custom UI Logging

* `useLogHook` - used to get instance of logger.
* `withLogPath` - is used to combine components path in runtime. So that when logging a message, it will include the path of
all the components for easier debugging.

Examples:

```js
function SimpleComponent() {
  const log = useLogHook();

  log.debug('debug message');
  log.info('info message');
  log.warn('warning message');
  log.error('error message');

  return <div>Simple component</div>;
}
```

```jsx
// simple-name.component.js
function SimpleNameInternal() {
  const log = useLogHook();

  log.info('info message');

  return <div>Simple Name</div>;
}

export const SimpleName = withLogPath(SimpleNameInternal, 'SimpleName');

// admin-page.component.js
function AdminPageInternal() {
	const log = useLogHook();

	log.debug('debug message');

	return (<div>
		<div>Admin page</div>
		<SimpleName />
	</div>);
}

export const AdminPage = withLogPath(AdminPageInternal, 'AdminPage');

// project-page.component.js
function ProjectPageInternal() {
	const log = useLogHook();

	log.warn('warning message');

	return (<div>
		<div>Project page</div>
		<SimpleName />
	</div>);
}

export const ProjectPage = withLogPath(ProjectPageInternal, 'ProjectPage');

// Logged result: 
// - using <AdminPage />
// { ..., path: 'AdminPage', message: 'debug message', ... }
// { ..., path: 'AdminPage/SimpleName', message: 'info message', ... }
// - using <ProjectPage />
// { ..., path: 'ProjectPage', message: 'warning message', ... }
// { ..., path: 'ProjectPage/SimpleName', message: 'info message', ... }
```

### Custom UI Error Handling


#### ErrorBoundary

Used to catch rendering exceptions and display a fallback UI.

Use helper `withErrorBoundary`, to wrap component during creation:

```
withErrorBoundary(Component, fallbackRender?: (props, resetErrorFn) => ReactNode);

fallbackRender - is optional
    props - propagated from Component
    resetErrorFn - function to reset Error state
```

```jsx
// example of usage "withErrorBoundary"

function AdminPageInternal() {
	return <div>Admin page</div>;
}

function FallbackUI() {
	return <div>Fallback UI page</div>;
}

export const AdminPage = withLogPath(withErrorBoundary(AdminPageInternal, () => <FallbackUI />), 'AdminPage'); 
```

#### ErrorBoundaryRoot

Used to catch rendering exceptions and display a fallback UI.
It works similar to `ErrorBoundary` but additionally registers to 'error' events, and 'unhandledrejection' to log unexpected exceptions on click handlers, timeouts and other async operations.

* Use helper `withErrorBoundaryRoot`, to wrap component on create.
* Must be used only once on a top-level component, like: AdminPage, ProjectPage, ...

### Tests Style Guide

* **Custom UI:** in `./static/qtest-lite-components/src/__mocks__` will define the most generic mocks, as needed for Forge
  library. [read more](https://jestjs.io/docs/manual-mocks#mocking-user-modules)
* **Custom UI:** When creating a test that uses a `Snapshot`, `__snapshots__` folder must be committed
  too. ["Snapshots" read more](https://jestjs.io/docs/snapshot-testing)
* Each test must start with `describe` and inside of it should reside the functional tests:
  ```js
  describe('Test SimpleName component', () => {
    let component;
  
    beforeAll(() => {
      jest.mock('@forge/bridge');
      component = renderer.create(<SimpleName />);
    });
  
    test('Component rendered correctly', () => {
      expect(component.toJSON()).toMatchSnapshot();
    });
  });
  ```  

Happy coding! :)
