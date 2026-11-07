//
//  Browse.swift
//  spin-mobile-client
//
//  Created by Abhi on 11/6/26.
//
import SwiftUI

struct BrowseView: View {
    
    @Environment(\.colorScheme) var colorScheme
    
    var currentTheme: AppTheme {
        colorScheme.currentTheme
    }
    
    @State
    private var viewModel: BrowseViewModel = BrowseViewModel()
    
    
    var body: some View {
        
        let columns = [GridItem(.flexible()), GridItem(.flexible())]
        
        VStack {
            ScrollView {
                LazyVGrid(columns: columns)  {
                    ForEach(viewModel.recordsData, id: \.postId) {
                        records in RecordCard(
                            artist: records.artist,
                            album: records.album,
                            color: records.color ?? "Blue",
                            genre: records.genre ?? ["Strings"],
                            storeLink: records.link ?? "https://google.com",
                            image: records.thumbnail?.replacing("http://", with: "https://") ?? "https://media1.tenor.com/m/LYl36-NgLeUAAAAd/idk-emoji-shrug-emoji.gif",
                            releaseType: records.releaseType
                        )
                        .transition(.opacity)
                    }
                }
            }
        }
        .font(currentTheme.font)
        .padding(.top, 10)
        .foregroundStyle(.black)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(currentTheme.mainColor)
        .task {
            await viewModel.getRecords()
        }
    }
}

#Preview {
    BrowseView()
}

