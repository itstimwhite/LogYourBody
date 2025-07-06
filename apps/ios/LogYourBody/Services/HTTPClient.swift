import Foundation

final class HTTPClient {
    static let shared = HTTPClient()
    private init() {}

    enum NetworkError: LocalizedError {
        case invalidResponse
    }

    func sendRequest(
        url: URL,
        method: String,
        headers: [String: String] = [:],
        body: Data? = nil
    ) async throws -> (Data, HTTPURLResponse) {
        var request = URLRequest(url: url)
        request.httpMethod = method
        headers.forEach { request.setValue($0.value, forHTTPHeaderField: $0.key) }
        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        return (data, httpResponse)
    }
}
