using System;
using System.Drawing;
using SharpMap;
using SharpMap.Layers;
using SharpMap.Rendering;
using SharpMap.Styles;
using log4net;

namespace MapService.Components.MapExport.SharpMapExtensions {
    public class MapThrowsException : Map
    {
        ILog _log = LogManager.GetLogger(typeof(MapThrowsException));
        public MapThrowsException(Size size) : base(size)
        {
        }

        /// <summary>
        /// Renders the map to an image with the supplied resolution
        /// </summary>
        /// <param name="resolution">The resolution of the image</param>
        /// <returns>The map image</returns>
        public new Image GetMap(int resolution)
        {
            _log.Debug("getMap with the resolution" + resolution);
            Size size = this.Size;
            int width = size.Width;
            size = this.Size;
            int height = size.Height;
            Image image = (Image)new Bitmap(width, height);
            _log.Debug("getMap2");
            ((Bitmap)image).SetResolution((float)resolution, (float)resolution);
            _log.Debug("getMap3");
            Graphics g = Graphics.FromImage(image);
            _log.Debug("getMap4");
            this.RenderMap(g);
            _log.Debug("getMap5");
            g.Dispose();
            _log.Debug("getMap6");
            return image;
        }


        /// <summary>
        /// Renders the map using the provided <see cref="T:System.Drawing.Graphics" /> object.
        /// Uses custom <see cref="LayerCollectionRendererThrowsException"/> in order to honor WmsLayer property ContinueOnError.
        /// If ContinueOnError is false, an exception will be thrown. 
        /// If ContinueOnErrror is true, a red X will be drawn instead of the layer.
        /// </summary>
        /// <param name="g">the <see cref="T:System.Drawing.Graphics" /> object to use</param>
        /// <exception cref="T:System.ArgumentNullException">if <see cref="T:System.Drawing.Graphics" /> object is null.</exception>
        /// <exception cref="T:System.InvalidOperationException">if there are no layers to render.</exception>
        public new void RenderMap(Graphics g)
        {
            _log.Debug("RenderMap");
            OnMapRendering(g);
            _log.Debug("RenderMap2");

            if (g == null)
                throw new ArgumentNullException("g", "Cannot render map with null graphics object!");

            //Pauses the timer for VariableLayer
            VariableLayerCollection.Pause = true;

            if ((Layers == null || Layers.Count == 0) && (BackgroundLayer == null || BackgroundLayer.Count == 0) && (VariableLayers == null || VariableLayers.Count == 0))
                throw new InvalidOperationException("No layers to render");

            _log.Debug("RenderMap3");
            lock (MapTransform)
            {
                _log.Debug("RenderMap4");
                g.Transform = MapTransform.Clone();
            }
            _log.Debug("RenderMap5");
            g.Clear(BackColor);
            _log.Debug("RenderMap6");
            g.PageUnit = GraphicsUnit.Pixel;

            double zoom = Zoom;
            double scale = double.NaN; //will be resolved if needed

            _log.Debug("RenderMap7");
            ILayer[] layerList;
            if (BackgroundLayer != null && BackgroundLayer.Count > 0)
            {
                _log.Debug("RenderMap8");
                layerList = new ILayer[BackgroundLayer.Count];
                BackgroundLayer.CopyTo(layerList, 0);
                foreach (ILayer layer in layerList)
                {
                    _log.Debug("RenderMap9 " + layer.LayerName);
                    if (layer.VisibilityUnits == VisibilityUnits.Scale && double.IsNaN(scale))
                    {
                        scale = MapScale;
                    }
                    double visibleLevel = layer.VisibilityUnits == VisibilityUnits.ZoomLevel ? zoom : scale;

                    _log.Debug("RenderMap10");
                    OnLayerRendering(layer, LayerCollectionType.Background);
                    if (layer.Enabled)
                    {
                        _log.Debug("RenderMap11");
                        if (layer.MaxVisible >= visibleLevel && layer.MinVisible < visibleLevel)
                        {
                            _log.Debug("RenderMap12");
                            LayerCollectionRendererThrowsException.RenderLayer(layer, g, this);
                        }
                    }
                    _log.Debug("RenderMap13");
                    OnLayerRendered(layer, LayerCollectionType.Background);
                }
            }

            if (Layers != null && Layers.Count > 0)
            {
                _log.Debug("RenderMap14");
                layerList = new ILayer[Layers.Count];
                Layers.CopyTo(layerList, 0);

                _log.Debug("RenderMap15");
                //int srid = (Layers.Count > 0 ? Layers[0].SRID : -1); //Get the SRID of the first layer
                foreach (ILayer layer in layerList)
                {
                    _log.Debug("RenderMap16" + layer.LayerName);
                    if (layer.VisibilityUnits == VisibilityUnits.Scale && double.IsNaN(scale))
                    {
                        scale = MapScale;
                    }
                    double visibleLevel = layer.VisibilityUnits == VisibilityUnits.ZoomLevel ? zoom : scale;
                    _log.Debug("RenderMap17");
                    OnLayerRendering(layer, LayerCollectionType.Static);
                    _log.Debug("RenderMap18");
                    if (layer.Enabled && layer.MaxVisible >= visibleLevel && layer.MinVisible < visibleLevel)
                        LayerCollectionRendererThrowsException.RenderLayer(layer, g, this);

                    _log.Debug("RenderMap19");
                    OnLayerRendered(layer, LayerCollectionType.Static);
                    _log.Debug("RenderMap20");
                }
            }

            if (VariableLayers != null && VariableLayers.Count > 0)
            {
                _log.Debug("RenderMap21");
                layerList = new ILayer[VariableLayers.Count];
                _log.Debug("RenderMap22");
                VariableLayers.CopyTo(layerList, 0);
                foreach (ILayer layer in layerList)
                {
                    _log.Debug("RenderMap23" + layer.LayerName);
                    if (layer.VisibilityUnits == VisibilityUnits.Scale && double.IsNaN(scale))
                    {
                        scale = MapScale;
                    }
                    double visibleLevel = layer.VisibilityUnits == VisibilityUnits.ZoomLevel ? zoom : scale;
                    if (layer.Enabled && layer.MaxVisible >= visibleLevel && layer.MinVisible < visibleLevel)
                        LayerCollectionRendererThrowsException.RenderLayer(layer, g, this);
                        
                }
            }

#pragma warning disable 612,618
            RenderDisclaimer(g);
#pragma warning restore 612, 618

            _log.Debug("RenderMap24");
            // Render all map decorations
            foreach (var mapDecoration in Decorations)
            {
                _log.Debug("RenderMap25");
                mapDecoration.Render(g, this);
            }
            //Resets the timer for VariableLayer
            VariableLayerCollection.Pause = false;

            _log.Debug("RenderMap26");
            OnMapRendered(g);
            _log.Debug("RenderMap27");
        }

        [Obsolete]
        private void RenderDisclaimer(Graphics g)
        {
            //Disclaimer
            if (!String.IsNullOrEmpty(Disclaimer))
            {
                var size = VectorRenderer.SizeOfString(g, Disclaimer, DisclaimerFont);
                size.Width = (Single)Math.Ceiling(size.Width);
                size.Height = (Single)Math.Ceiling(size.Height);
                StringFormat sf;
                switch (DisclaimerLocation)
                {
                    case 0: //Right-Bottom
                        sf = new StringFormat();
                        sf.Alignment = StringAlignment.Far;
                        g.DrawString(Disclaimer, DisclaimerFont, Brushes.Black,
                            g.VisibleClipBounds.Width,
                            g.VisibleClipBounds.Height - size.Height - 2, sf);
                        break;
                    case 1: //Right-Top
                        sf = new StringFormat();
                        sf.Alignment = StringAlignment.Far;
                        g.DrawString(Disclaimer, DisclaimerFont, Brushes.Black,
                            g.VisibleClipBounds.Width, 0f, sf);
                        break;
                    case 2: //Left-Top
                        g.DrawString(Disclaimer, DisclaimerFont, Brushes.Black, 0f, 0f);
                        break;
                    case 3://Left-Bottom
                        g.DrawString(Disclaimer, DisclaimerFont, Brushes.Black, 0f,
                            g.VisibleClipBounds.Height - size.Height - 2);
                        break;
                }
            }
        }
    }
}