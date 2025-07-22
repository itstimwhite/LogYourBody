fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios lint

```sh
[bundle exec] fastlane ios lint
```

Run SwiftLint

### ios test

```sh
[bundle exec] fastlane ios test
```

Run tests

### ios build_dev

```sh
[bundle exec] fastlane ios build_dev
```

Build for development

### ios alpha

```sh
[bundle exec] fastlane ios alpha
```

Build and upload Alpha to TestFlight (dev branch - rapid)

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Build and upload to TestFlight (preview branch - beta)

### ios ci_build

```sh
[bundle exec] fastlane ios ci_build
```

Build for CI

### ios build_release

```sh
[bundle exec] fastlane ios build_release
```

Build for release (archive only)

### ios upload_testflight

```sh
[bundle exec] fastlane ios upload_testflight
```

Upload existing IPA to TestFlight

### ios submit_app_store

```sh
[bundle exec] fastlane ios submit_app_store
```

Submit existing IPA to App Store

### ios release

```sh
[bundle exec] fastlane ios release
```

Deploy to App Store (build + upload)

### ios setup_certificates

```sh
[bundle exec] fastlane ios setup_certificates
```

Create development certificates and profiles

### ios setup_distribution

```sh
[bundle exec] fastlane ios setup_distribution
```

Create distribution certificates and profiles

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
