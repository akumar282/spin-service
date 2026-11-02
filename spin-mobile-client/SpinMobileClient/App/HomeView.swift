//
//  ContentView.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/21/26.
//

import SwiftUI
import SwiftData

struct HomeView: View {
    
    @Environment(\.colorScheme) var colorScheme
    
    var currentTheme: AppTheme {
        colorScheme.currentTheme
    }
    
    @State
    private var viewModel: HomeViewModel = HomeViewModel()
    
    var body: some View {
        VStack {
            HStack (alignment: .center) {
                Text("spin-service")
                    .font(.custom("JetBrainsMono-Regular", size: 21))
                    .frame(maxWidth: .infinity)
                    .overlay(alignment: .trailing) {
                        Button(action: {}) {
                            Image(systemName: "bell")
                                .font(.system(size: 23))
                        }
                        .buttonStyle(.glass)
                        .buttonBorderShape(.circle)
                    }
                    .padding(.leading)
            }
            .padding([.trailing])
            ScrollView(.vertical, showsIndicators: false) {
            
                VStack(alignment: .leading) {
                    Text("Welcome!")
                        .padding([.leading, .top], 10)
                        .padding(.bottom, 2)
                        .font(.custom("JetBrainsMono-Regular", size: 16))
                    HomeNavButton(action: {}, title: "Browse Latest Releases", assetName: "vinyl")
                    HomeNavButton(action: {}, title: "Manage Notification Targets", assetName: "alarm")
                    HomeNavButton(action: {}, title: "Manage User Information", assetName: "settings")
                }
                .padding([.top], 5)
                
                VStack(alignment: .leading) {
                    Text("Recent Releases")
                        .padding([.leading, .top], 10)
                        .padding(.bottom, 1)
                        .font(.custom("JetBrainsMono-Regular", size: 16))
                    Text("Releases, Restocks, Represses that have happened in the past 24 hours")
                        .padding([.leading], 10)
                        .font(.custom("JetBrainsMono-Regular", size: 11))
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(viewModel.recordsData, id: \.postId) {
                                records in RecordCard(
                                    artist: records.artist,
                                    album: records.album,
                                    color: records.color ?? "Blue",
                                    genre: records.genre ?? ["Strings"],
                                    storeLink: records.link ?? "https://google.com",
                                    image: records.thumbnail,
                                    releaseType: records.releaseType
                                )
                            }
                        }
                    }
                    .padding([.leading], 5)
                }
                .task {
                    await viewModel.getRecords()
                }
                
                VStack(alignment: .leading) {
                    Text("Upcoming Albums")
                        .padding([.leading, .top], 10)
                        .padding(.bottom, 1)
                        .font(.custom("JetBrainsMono-Regular", size: 16))
                    Text("Albums that have potential drops upon release")
                        .padding([.leading], 10)
                        .font(.custom("JetBrainsMono-Regular", size: 11))
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(viewModel.upcomingReleaseData, id: \.id) {
                                upcoming in UpcomingReleaseCard(
                                    artist: upcoming.artist,
                                    album: upcoming.album
                                )
                            }
                        }
                        .padding([.leading], 5)
                    }
                }
                .task {
                    await viewModel.getUpcoming()
                }
            }
            
        }
        .font(currentTheme.font)
        .padding(.top, 10)
        .foregroundStyle(.black)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(currentTheme.mainColor)
    }
}

struct HomeNavButton: View {
    let action: () -> Void
    let title: String
    let assetName: String
    
    var body: some View {
        VStack {
            Button(action: action) {
                HStack {
                    Text(title)
                        .padding(.leading, 3)
                    Spacer()
                    Image(assetName)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 35, height: 35)
                        .padding(.trailing, 5)
                }
                .padding(.all, 10)
                .overlay(RoundedRectangle(cornerRadius:8)
                    .stroke(Orange400, lineWidth: 1.5)
                )
                .background(
                    LinearGradient(colors: [Slate300, .white, Slate300], startPoint: .top, endPoint: .bottom),
                    in: RoundedRectangle(cornerRadius: 8)
                )
                .shadow(radius: 2, y: 1)
            }
            .padding([.bottom, .leading, .trailing], 7)
        }
    }
}


#Preview {
    HomeView()
}
