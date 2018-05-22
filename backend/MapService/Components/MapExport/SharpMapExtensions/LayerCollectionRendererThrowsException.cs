using System;
using System.Collections.Generic;
using System.Drawing;
using SharpMap;
using SharpMap.Layers;
using SharpMap.Rendering;
using log4net;

namespace MapService.Components.MapExport.SharpMapExtensions {
    public class LayerCollectionRendererThrowsException : LayerCollectionRenderer
    {
        static ILog _log = LogManager.GetLogger(typeof(LayerCollectionRendererThrowsException));
        public LayerCollectionRendererThrowsException(ICollection<ILayer> layers) : base(layers)
        {
        }


        /// <summary>
        /// Invokes the rendering of the layer; 
        /// Depending on the setting of ContinueOnError for the layer, 
        /// either a red X is drawn if it fails, or an exception is thrown.
        /// </summary>
        /// <param name="layer"></param>
        /// <param name="g"></param>
        /// <param name="map"></param>
        public static void RenderLayer(ILayer layer, Graphics g, Map map) {
            try 
            {
                _log.Debug("RenderLayer");
                layer.Render(g, map);
                _log.Debug("Layer rendered");
            }
            catch (Exception ex) 
            {
                _log.Debug("Exception was " + ex.Message);
                if (ContinueOnError(layer))
                {
                    _log.Debug("Continuing");
                    using (Pen pen = new Pen(Color.Red, 4f))
                    {
                        Size size = map.Size;
                        g.DrawLine(pen, 0, 0, size.Width, size.Height);
                        g.DrawLine(pen, size.Width, 0, 0, size.Height);
                        g.DrawRectangle(pen, 0, 0, size.Width, size.Height);
                    }
                }
                else
                {
                    throw;
                }
            }
        }

        private static bool ContinueOnError(ILayer layer)
        {
            _log.Debug("ContinueOnError");
            WmsLayer wmsLayer = layer as WmsLayer;
            if (wmsLayer != null)
            {
                _log.Debug("wmsLayer" + wmsLayer.LayerName);
                return wmsLayer.ContinueOnError;
            }
            return true;
        }
    }
}