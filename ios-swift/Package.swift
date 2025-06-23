// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "LogYourBody",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "LogYourBody",
            targets: ["LogYourBody"]),
    ],
    dependencies: [
        // Supabase
        .package(url: "https://github.com/supabase-community/supabase-swift.git", from: "2.0.0"),
        // RevenueCat
        .package(url: "https://github.com/RevenueCat/purchases-ios.git", from: "4.0.0"),
        // Kingfisher for image loading
        .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.0.0"),
        // Charts
        .package(url: "https://github.com/danielgindi/Charts.git", from: "5.0.0")
    ],
    targets: [
        .target(
            name: "LogYourBody",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "RevenueCat", package: "purchases-ios"),
                .product(name: "Kingfisher", package: "Kingfisher"),
                .product(name: "DGCharts", package: "Charts")
            ]),
        .testTarget(
            name: "LogYourBodyTests",
            dependencies: ["LogYourBody"]),
    ]
)